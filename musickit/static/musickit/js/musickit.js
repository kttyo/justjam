let scriptMusicKit = document.createElement("script");
scriptMusicKit.setAttribute("src", "https://js-cdn.music.apple.com/musickit/v3/musickit.js");
document.body.appendChild(scriptMusicKit);

let scriptLodash = document.createElement("script");
scriptLodash.setAttribute("src", "https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js");
document.body.appendChild(scriptLodash);

let params = new URLSearchParams(window.location.search);
let env = params.get("env");
let referenceURL = "https://justjam.jppj.jp";

if (env === "development") {
    referenceURL = "http://localhost:8000";
}

// Identify Client Browser
const userAgent = navigator.userAgent;
let browserName, fullVersion;

if (userAgent.indexOf("Chrome") > -1) {
browserName = "Chrome";
fullVersion = userAgent.split("Chrome/")[1].split(" ")[0];
} else if (userAgent.indexOf("Firefox") > -1) {
browserName = "Firefox";
fullVersion = userAgent.split("Firefox/")[1];
} else if (userAgent.indexOf("Safari") > -1) {
browserName = "Safari";
fullVersion = userAgent.split("Version/")[1].split(" ")[0];
} else {
browserName = "Unknown";
fullVersion = "Unknown";
}

function getNewToken() {
    return fetch(referenceURL + '/account/music-user-token')
        .then(response => response.json())
        .then(data => data['jwt']);
};

// Create Promise for document.addEventListener
const setupMusicKit = new Promise((resolve) => {
    document.addEventListener('musickitloaded', async (event) => {
        // MusicKit global is now defined (MusicKit.configure can return a configured MusicKit instance too)
        const token = await getNewToken()
        await MusicKit.configure({
            developerToken: token,
            app: {
                name: 'My Cool Web App',
                build: '2022.11.17',
                bundleId: 'jp.jppj.justjam'
            }
        })
        // resolve the Promise with a MusicKit instance
        resolve(MusicKit.getInstance())
    })
});

const promises = [setupMusicKit, getUserStatus()]
// Wait till MusicKit.configure gets completed
Promise.all(promises).then(async (results) => {
    const music = results[0]
    const user = results[1]
    
    //setupMusicKit.then(async (music) => {
    console.log('Entered Main Script')

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    console.log(localStorage)
    let tokenExists = false;
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        let pattern = /^music\.[a-z0-9]+\.[a-z0-9\-]+$/;
        if (pattern.test(localStorage.key(i))) {
            tokenExists = true
            break
        }
    }

    if (tokenExists) {
        const unauth = document.getElementById('unauth');
        const button = document.createElement('button');
        button.setAttribute('id', 'unauthenticate');
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-outline-primary');
        button.textContent = 'Sign out from Apple Music';

        unauth.appendChild(button)
    } else {
        const auth = document.getElementById('auth');
        const button = document.createElement('button');
        button.setAttribute('id', 'authenticate');
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-outline-primary');
        button.textContent = 'Sign in to Apple Music';

        auth.appendChild(button)
    }

    let authenticateButton = document.getElementById('authenticate');
    if (authenticateButton) {
        authenticateButton.addEventListener('click', async () => {
            result = await music.authorize();
        })
    }

    let unauthenticateButton = document.getElementById('unauthenticate');
    if (unauthenticateButton) {
        unauthenticateButton.addEventListener('click', async () => {
            result = await music.unauthorize();
        })
    }

    // let authenticateButton = document.getElementById('authenticate')
    // authenticateButton.addEventListener('click', async () => {
    //     await music.authorize()
    // })

    console.log('Main script starts')

    music.volume = 0.8;

    // Info Display
    // let artworkImg = document.getElementById('artwork');
    let timeScope = document.getElementById('timescope');
    let timeScopeAfter = document.getElementById('timescope-after');
    let timeScopeDotPos = document.getElementById('timescope-dot-position');
    let timeScopeDot = document.getElementById('timescope-dot');
    let songName = document.getElementById('media-item-title');
    let currentAlgumInfo = document.getElementById('album-info')
    let playbackTime = document.getElementById('playback-time');
    let playbackDuration = document.getElementById('playback-duration');

    let searchResultTabLink = document.getElementById('search-result-tab');
    searchResultTabLink.addEventListener('click', () => {
        mainScreen.displaySearchResult()
    })

    let nowPlayingAlbumTabLink = document.getElementById('now-playing-album-tab');
    nowPlayingAlbumTabLink.addEventListener('click', () => {
        mainScreen.displayNowPlayingAlbum()
    })

    // Main Screen
    class MainScreen {
        constructor(prt) {
            this.parentElement = prt;
            this.searchResult = document.createElement('div');
            this.nowPlayingAlbum = document.createElement('div');
            this.favorite = document.createElement('div');
        };

        setSearchResult(result) {
            this.searchResult = result
        };

        displaySearchResult() {
            this.parentElement.textContent = '';
            this.parentElement.appendChild(this.searchResult);
        };

        setNowPlayingAlbum(album) {
            this.nowPlayingAlbum = album;
        };

        displayNowPlayingAlbum() {
            this.parentElement.textContent = '';
            this.parentElement.appendChild(this.nowPlayingAlbum);
        };

        setFavorite(fav) {
            this.favorite = fav;
        };

        displayFavorite() {
            this.parentElement.textContent = '';
            this.parentElement.appendChild(this.favorite);
        };
    };

    let mainScreen = new MainScreen(document.getElementById('main-screen'))


    // Favorite Item Class
    class FavoriteItem {
        constructor() {
            this.favorite = null
        };

        async refreshFavoriteData() {
            let fetchResponse = await fetch(referenceURL + '/api/favorite/item',
                {
                    credentials: 'include'
                }
            )
            this.favorite = await fetchResponse.json()
        };
    }
    let favoriteDataInstance = new FavoriteItem()
    if (user.authenticated) {
        await favoriteDataInstance.refreshFavoriteData()
    }

    // Favorite Part Class
    class FavoritePart {
        constructor() {
            this.favorite = null
        };

        async refreshFavoriteData() {
            let fetchResponse = await fetch(referenceURL + '/api/favorite/part',
                {
                    credentials: 'include'
                }
            )
            this.favorite = await fetchResponse.json()
        };
    }

    let favoritePartInstance = new FavoritePart()
    if (user.authenticated) {
        await favoritePartInstance.refreshFavoriteData()
    }

    // Initialize Favorite Tab
    async function refreshFavoriteTab() {

        songIdList = []
        albumIdList = []
        for (favorite of favoriteDataInstance.favorite) {
            if (favorite.media_type == 'song') {
                songIdList.push(favorite.media_id)
            } else if (favorite.media_type == 'album') {
                albumIdList.push(favorite.media_id)
            }
        }

        const wrapperDiv = document.createElement("div")

        if (favoritePartInstance.favorite.length > 0) {
            const headerSongs = document.createElement("h2");
            headerSongs.textContent = 'Loops';
            wrapperDiv.appendChild(headerSongs);
            const favoriteParts = favoritePartInstance.favorite
            const favoritePartsSorted = _.sortBy(favoriteParts, ['songInfo.attributes.artistName', 'songInfo.attributes.name', 'loop_start_time']);
            wrapperDiv.appendChild(await getLoopCards(favoritePartsSorted))
        }

        if (songIdList.length > 0) {
            const headerSongs = document.createElement("h2");
            headerSongs.textContent = 'Songs';
            wrapperDiv.appendChild(headerSongs);

            try {
                const queryParameters = { ids: songIdList, l: navigator.language };
                const searchedSongs = await music.api.music('/v1/catalog/{{storefrontId}}/songs', queryParameters);
                const searchedSongsSorted = _.sortBy(searchedSongs.data.data, ['attributes.artistName', 'attributes.name']);
                wrapperDiv.appendChild(await getSongCards(searchedSongsSorted))
            } catch (error) {
                console.error(error);
            }
        }

        if (albumIdList.length > 0) {
            const headerAlbums = document.createElement("h2");
            headerAlbums.textContent = 'Albums';
            wrapperDiv.appendChild(headerAlbums);
            try {
                const queryParameters = { ids: albumIdList, l: navigator.language };
                const searchedAlbums = await music.api.music(`/v1/catalog/{{storefrontId}}/albums`, queryParameters);
                const searchedAlbumsSorted = _.sortBy(searchedAlbums.data.data, ['attributes.artistName', 'attributes.name']);
                wrapperDiv.appendChild(await getAlbumCards(searchedAlbumsSorted))
            } catch (error) {
                console.error(error);
            }
        }

        mainScreen.setFavorite(wrapperDiv)
    }
    if (user.authenticated) {
        await refreshFavoriteTab()
        mainScreen.displayFavorite()
    }

    let favoriteTabLink = document.getElementById('favorite-tab');
    favoriteTabLink.addEventListener('click', () => {
        mainScreen.displayFavorite()
    })

    function getFormattedTime(timeInSeconds) {

        let hours = MusicKit.formattedSeconds(timeInSeconds).hours;
        let minutes = (MusicKit.formattedSeconds(timeInSeconds).minutes < 10 && hours > 0 ? '0' : '') + MusicKit.formattedSeconds(timeInSeconds).minutes;
        let seconds = ((timeInSeconds % 60) < 10 ? '0' : '') + (timeInSeconds % 60);

        let durationString = hours >= 1 ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;

        return durationString
    }

    function updateCurrentPlayingItem() {
        songName.textContent = music.nowPlayingItem.attributes.name
        currentAlgumInfo.textContent = music.nowPlayingItem.artistName + ' | ' + music.nowPlayingItem.albumName
        playbackDuration.textContent = getFormattedTime(music.currentPlaybackDuration)
    }


    async function refreshLooper() {
        try {
            const songId = music.nowPlayingItem.id;
            const queryParameters = { l: navigator.language };
            const song = await music.api.music(`/v1/catalog/{{storefrontId}}/songs/${songId}`, queryParameters);
            console.log(song.data.data[0])

            looper.setMediaItem({
                'id': music.nowPlayingItem.id,
                'parentId': song.data.data[0].relationships.albums.data[0].id,
                'type': music.nowPlayingItem.type
            });
            looper.setStartTime(0);
            looper.setEndTime(music.currentPlaybackDuration);

            looperStartDotPos.style.left = '0%';
            looperEndDotPos.style.left = '100%';
        } catch (error) {
            console.error(error);
        }
    }

    async function refreshMainLoopFavButton() {
        const favoritePart = document.getElementById('favorite-part');
        favoritePart.textContent = ''
        let favButton = generateFavButtonForPart('song-part', looper.mediaItem.parentId, looper.mediaItem.id, looper.startTime, looper.endTime)
        favoritePart.appendChild(favButton)
        checkExisitingFavoritePart(favButton, looper.mediaItem.id, looper.startTime, looper.endTime)
    }


    music.addEventListener('nowPlayingItemDidChange', async (event) => {
        updateCurrentPlayingItem()
        await refreshLooper()
        if (user.authenticated) {
            refreshMainLoopFavButton()
        }
    })

    music.addEventListener('playbackTimeDidChange', async () => {
        // Check Looper
        if (looper.isOn && music.currentPlaybackTime < looper.startTime) {
            await music.seekToTime(looper.startTime)
        } else if (looper.isOn && music.currentPlaybackTime >= looper.endTime) {
            await music.seekToTime(looper.startTime)
        }

        // Time Display
        playbackTime.textContent = getFormattedTime(music.currentPlaybackTime)

        let portionPlayed = music.currentPlaybackTime / music.currentPlaybackDuration;
        let pixedToBeColored = Math.floor(portionPlayed * timeScope.offsetWidth);
        timeScopeAfter.style.width = pixedToBeColored + 'px';
        timeScopeDotPos.style.left = pixedToBeColored + 'px';
    })

    music.addEventListener('playbackStateDidChange', () => {
        if (music.playbackState == 10) {
            playPauseButton.textContent = '▶︎'
        }
    })


    music.addEventListener('playbackVolumeDidChange', () => {
        let pixedToBeColored = Math.floor(music.volume * volumeScope.offsetWidth);
        volumeScopeAfter.style.width = pixedToBeColored + 'px';
        volumeScopeDotPos.style.left = pixedToBeColored + 'px';
    })


    // Player Control
    let volumeControl = document.getElementById('volume-control');
    let volumeScope = document.getElementById('volume-scope');
    volumeScope.addEventListener('click', async (e) => {
        let barWidth = volumeScope.offsetWidth;
        let clickedSpot = Math.floor(e.clientX - volumeScope.getBoundingClientRect().left);
        let volumeInDecimal = Math.round(clickedSpot / barWidth * 10) / 10;
        if (volumeInDecimal <= 1) {
            music.volume = volumeInDecimal
        }
    })

    let volumeScopeAfter = document.getElementById('volume-scope-after');
    let volumeScopeDotPos = document.getElementById('volume-scope-dot-position');
    let volumeScopeDot = document.getElementById('volume-scope-dot');

    volumeScopeDot.addEventListener('drag', (e) => {
        let barWidth = volumeScope.offsetWidth;
        let cursorLocation = Math.floor(e.clientX - volumeScope.getBoundingClientRect().left);
        let volumeInDecimal = Math.round(cursorLocation / barWidth * 10) / 10;
        if (volumeInDecimal <= 1 && volumeInDecimal >= 0) {
            music.volume = volumeInDecimal
        }
    })

    let playPauseButton = document.getElementById('play-pause');
    let previousButton = document.getElementById('previous-item');
    let nextButton = document.getElementById('next-item');

    // Click Control on the Player Progress
    timeScope.addEventListener('click', async (e) => {
        console.log('timeScope click')
        let barWidth = timeScope.offsetWidth;
        let clickedSpot = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
        let clickedSpotInSeconds = Math.floor(clickedSpot / barWidth * music.currentPlaybackDuration)
        // Check Looper
        if (looper.isOn && clickedSpotInSeconds < looper.startTime) {
            await music.seekToTime(looper.startTime)
        } else if (looper.isOn && clickedSpotInSeconds >= looper.endTime && looper.endTime - 2 >= looper.startTime) {
            await music.seekToTime(looper.endTime - 2)
        } else if (looper.isOn && clickedSpotInSeconds >= looper.endTime) {
            await music.seekToTime(looper.startTime)
        } else {
            await music.seekToTime(clickedSpotInSeconds)
        }
    })

    timeScopeDot.addEventListener('dragend', async (e) => {
        if (browserName != "Safari" || window.outerWidth === window.innerWidth) {
            let barWidth = timeScope.offsetWidth;
            let cursorPosision = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
            const duration = music.currentPlaybackDuration;
            const clickedSpotInSeconds = Math.round(cursorPosision / barWidth * duration)
            timeScopeDotPos.style.left = cursorPosision + 'px'

            let destinationTime;
            if (clickedSpotInSeconds < 0) {
                destinationTime = 0
            } else if (clickedSpotInSeconds > duration) {
                destinationTime = duration
            } else {
                destinationTime = clickedSpotInSeconds
            }

            if (looper.isOn && destinationTime < looper.startTime) {
                await music.seekToTime(looper.startTime)
            } else if (looper.isOn && destinationTime >= looper.endTime && looper.endTime - 2 >= looper.startTime) {
                await music.seekToTime(looper.endTime - 2)
            } else if (looper.isOn && clickedSpotInSeconds >= looper.endTime) {
                await music.seekToTime(looper.startTime)
            } else {
                await music.seekToTime(destinationTime)
            }
        }
    })

    playPauseButton.addEventListener('click', function () {
        if (music.queue.currentItem.isPlayable && music.isPlaying) {
            music.pause();
            playPauseButton.textContent = '▶︎'
        } else if (music.queue.currentItem.isPlayable) {
            music.play();
            playPauseButton.textContent = '||'
        }
    })

    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            event.preventDefault();
        }
        if (event.code === 'Space' && music.queue.currentItem.isPlayable && music.isPlaying) {
            music.pause();
            playPauseButton.textContent = '▶︎'
        } else if (event.code === 'Space' && music.queue.currentItem.isPlayable) {
            music.play();
            playPauseButton.textContent = '||'
        }
    })

    // Looper
    class Looper {
        constructor() {
            this.isOn = false;
            this.startTime = 0;
            this.endTime = 0;
            this.mediaItem = null;
            this.mediaParentItem = null;

            this.looperButton = document.getElementById('looper-switch');
            this.looperStartDotPos = document.getElementById('looper-start-dot-position');
            this.looperStartDot = document.getElementById('looper-start-dot');
            this.looperEndDotPos = document.getElementById('looper-end-dot-position');
            this.looperEndDot = document.getElementById('looper-end-dot');
            this.favoriteButton = document.getElementById('favorite-part');
        };

        looperSwitch() {
            if (this.isOn) {
                this.isOn = false
            } else if (this.endTime > this.startTime) {
                this.isOn = true
            } else {
                console.log('End time must be larger than start time.')
            }
        };

        switchOn() {
            this.isOn = true

            this.looperButton.textContent = 'Looper Off'
            this.looperStartDot.style.display = 'inline-block'
            this.looperEndDot.style.display = 'inline-block'
            this.favoriteButton.style.display = 'inline-block'

        };

        switchOff() {
            this.isOn = false

            this.looperButton.textContent = 'Looper On'
            this.looperStartDot.style.display = 'none'
            this.looperEndDot.style.display = 'none'
            this.favoriteButton.style.display = 'none'
        };

        setStartTime(startAt) {
            let button = this.favoriteButton.getElementsByTagName('button')[0]
            if (startAt > this.endTime) {
                this.endTime = startAt;
                setLooperDotPos(this.endTime, this.looperEndDotPos)
                if (button != null) {
                    button.setAttribute('start-time', this.endTime)
                }

            }
            this.startTime = startAt;
            setLooperDotPos(this.startTime, this.looperStartDotPos)
            if (button != null) {
                button.setAttribute('start-time', this.startTime)
            }
        };

        setEndTime(endAt) {
            let button = this.favoriteButton.getElementsByTagName('button')[0]
            if (endAt > this.startTime) {
                this.endTime = endAt;
                setLooperDotPos(this.endTime, this.looperEndDotPos)
                if (button != null) {
                    button.setAttribute('end-time', this.endTime)
                }
            } else if (this.isOn == true) {
                console.log('End time must be larger than start time.')
            }

        };

        setMediaItem(mediaData) {
            this.mediaItem = mediaData
        };

        setMediaParent(parentId) {
            this.mediaParentItem = parentId
        };
    };

    let looper = new Looper();

    let looperStartDotPos = document.getElementById('looper-start-dot-position');
    let looperStartDot = document.getElementById('looper-start-dot');
    let looperEndDotPos = document.getElementById('looper-end-dot-position');
    let looperEndDot = document.getElementById('looper-end-dot');
    let favoriteButton = document.getElementById('favorite-part');

    function setLooperDotPos(timeInSeconds, dotPosElement) {
        let barWidth = timeScope.offsetWidth;
        let duration = music.currentPlaybackDuration;
        let percentage = timeInSeconds / duration
        let positionInPixels = Math.round(barWidth * percentage)
        dotPosElement.style.left = positionInPixels + 'px'
    }

    looperStartDot.addEventListener('dragend', async (e) => {
        if (browserName != "Safari" || window.outerWidth === window.innerWidth) {
            let barWidth = timeScope.offsetWidth;
            let cursorLocation = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
            let duration = music.currentPlaybackDuration;
            let clickedSpotInSeconds = Math.round(cursorLocation / barWidth * duration)

            let endDotLeftInPixels = looperEndDotPos.style.left.indexOf('%') > -1 ? looperEndDotPos.style.left.substring(0, looperEndDotPos.style.left.length - 1) / 100 * barWidth : looperEndDotPos.style.left.substring(0, looperEndDotPos.style.left.length - 2)


            if (cursorLocation < 0) {
                looperStartDotPos.style.left = '0px'
            } else if (cursorLocation > endDotLeftInPixels) {
                looperStartDotPos.style.left = (endDotLeftInPixels - 1) + 'px'
            } else {
                looperStartDotPos.style.left = cursorLocation + 'px'
            }

            let destinationTime;
            if (clickedSpotInSeconds < 0) {
                destinationTime = 0
            } else if (clickedSpotInSeconds >= looper.endTime) {
                destinationTime = looper.endTime - 1
            } else {
                destinationTime = clickedSpotInSeconds
            }
            looper.setStartTime(Number(destinationTime))
            await music.seekToTime(looper.startTime)
        }
    })

    looperEndDot.addEventListener('dragend', async (e) => {
        if (browserName != "Safari" || window.outerWidth === window.innerWidth) {
            let barWidth = timeScope.offsetWidth;
            let cursorLocation = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
            let duration = music.currentPlaybackDuration;
            let clickedSpotInSeconds = Math.round(cursorLocation / barWidth * duration)

            let startDotLeftInPixels = looperStartDotPos.style.left.indexOf('%') > -1 ? looperStartDotPos.style.left.substring(0, looperStartDotPos.style.left.length - 1) / 100 * barWidth : looperStartDotPos.style.left.substring(0, looperStartDotPos.style.left.length - 2)

            if (cursorLocation > barWidth) {
                looperEndDotPos.style.left = barWidth + 'px'
            } else if (cursorLocation < startDotLeftInPixels) {
                looperEndDotPos.style.left = (startDotLeftInPixels * 1 + 1) + 'px'
            } else {
                looperEndDotPos.style.left = cursorLocation + 'px'
            }

            let destinationTime;
            if (clickedSpotInSeconds <= looper.startTime) {
                destinationTime = looper.startTime + 1
            } else if (clickedSpotInSeconds > duration) {
                destinationTime = duration
            } else {
                destinationTime = clickedSpotInSeconds
            }
            looper.setEndTime(Number(destinationTime))

            if (destinationTime - 3 < looper.startTime) {
                await music.seekToTime(looper.startTime)
            } else {
                await music.seekToTime(destinationTime - 3)
            }
        }
    })

    let looperSwitch = document.getElementById('looper-switch');
    looperSwitch.addEventListener('click', () => {
        // looper.looperSwitch()
        if (looper.isOn) {
            console.log('looper.switchOff()')
            looper.switchOff()
        } else {
            console.log('looper.switchOn()')
            looper.switchOn()
        }
        console.log(looper)
    });

    // Previous and Next
    previousButton.addEventListener('click', function () {
        music.skipToPreviousItem();
    });

    nextButton.addEventListener('click', function () {
        music.skipToNextItem();
    });


    // Search Bar and Search Result
    let searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keypress', async (event) => {
        if (event.key == 'Enter') {
            const queryParameters = { term: event.target.value, types: ['albums', 'artists', 'songs'], l: navigator.language };
            searchResults = await music.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
            renderSearchResult(searchResults.data.results)
        }
    });


    // Now-playin Album Info for MainScreen Class
    async function getNowPlayingAlbumInfo(albumId) {

        const wrapperDiv = document.createElement("div");

        // Get album tracks
        try {
            const queryParameters = { l: navigator.language };
            let albumData = await music.api.music(`/v1/catalog/{{storefrontId}}/albums/${albumId}`, queryParameters);
            let albumTracks = albumData.data.data[0].relationships.tracks.data

            const headerNowPlayingAlbum = document.createElement("h2");
            headerNowPlayingAlbum.textContent = 'Now Playing Album';
            wrapperDiv.appendChild(headerNowPlayingAlbum);

            const headerNowPlayingAlbumInfo = document.createElement("h3");
            headerNowPlayingAlbumInfo.textContent = albumData.data.data[0].attributes.name + ' | ' + albumData.data.data[0].attributes.artistName;
            wrapperDiv.appendChild(headerNowPlayingAlbumInfo);

            for (const track of albumTracks) {
                const divtag = document.createElement("div");
                divtag.setAttribute('class', 'row');

                const leftCol = document.createElement("div");
                leftCol.setAttribute('class', 'col-1');

                const rightCol = document.createElement("div");
                rightCol.setAttribute('class', 'col-11');

                const para = document.createElement("p");
                para.setAttribute('media-type', 'song');
                para.setAttribute('song-id', track.attributes.id);
                para.setAttribute('album-id', albumId)
                para.setAttribute('id', track.attributes.id)
                const node = document.createTextNode(track.attributes.trackNumber + ': ' + track.attributes.name);
                para.appendChild(node);

                para.addEventListener('click', async (event) => {
                    const itemTag = event.target
                    looper.switchOff()
                    await music.changeToMediaAtIndex(music.queue.indexForItem(itemTag.getAttribute('song-id')))
                    playPauseButton.textContent = '||'
                    looper.setMediaItem({
                        'id': itemTag.getAttribute('song-id'),
                        'parentId': itemTag.getAttribute('album-id'),
                        'type': itemTag.getAttribute('media-type')
                    });
                    looper.setStartTime(Number(itemTag.getAttribute('start-time')))
                    looper.setEndTime(Number(itemTag.getAttribute('end-time')))
                })
                rightCol.appendChild(para)
                if (user.authenticated) {
                    let favButton = generateFavButton('song', albumId, track.attributes.id)
                    checkExisitingFavoriteData(favButton, 'song', track.attributes.id)
                    leftCol.appendChild(favButton);
                }
                divtag.appendChild(leftCol)
                divtag.appendChild(rightCol)
                wrapperDiv.appendChild(divtag)
            }
            return wrapperDiv
        } catch (error) {
            console.error(error);
        }
    }

    // Fav Button Clicked
    function favButtonClick(event) {
        console.log('favButton clicked')
        let favButton = event.target
        let mediaType = favButton.getAttribute('media-type');
        let requestMethod;
        console.log(looper)

        if (favButton.classList.contains('not-fav')) {
            // Adding to Favorite
            console.log('Requested to Add')
            favButton.classList.remove('not-fav')
            favButton.classList.add('fav')
            favButton.classList.remove('btn-outline-primary')
            favButton.classList.add('btn-primary')
            favButton.textContent = '♡'
            requestMethod = 'POST'

        } else if (favButton.classList.contains('fav')) {
            // Removing from Favorite
            console.log('Requested to Remove')
            favButton.classList.remove('fav')
            favButton.classList.add('not-fav')
            favButton.classList.remove('btn-primary')
            favButton.classList.add('btn-outline-primary')
            favButton.textContent = '♡'
            requestMethod = 'DELETE'
        }

        // Prepare options for API call

        let mediaId;
        if (mediaType == 'song') {
            mediaId = favButton.getAttribute('song-id');
        } else if (mediaType == 'album') {
            mediaId = favButton.getAttribute('album-id');
        }


        let fetchOptions;
        let fetchURL;
        if (mediaType == 'song' || mediaType == 'album') {
            fetchOptions = {
                method: requestMethod,
                credentials: 'include',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'media_type': mediaType,
                    'media_id': mediaId
                })
            }
            fetchURL = referenceURL + '/api/favorite/item'
        } else if (mediaType == 'song-part') {
            console.log('This is the logic for song-part')
            fetchOptions = {
                method: requestMethod,
                credentials: 'include',
                headers: {
                    "X-CSRFToken": getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'media_type': mediaType,
                    'media_id': favButton.getAttribute('song-id'),
                    'loop_start_time': Number(favButton.getAttribute('start-time')),
                    'loop_end_time': Number(favButton.getAttribute('end-time'))
                })
            }
            fetchURL = referenceURL + '/api/favorite/part'
        }

        console.log(fetchOptions)
        // Execute API call
        fetch(fetchURL, fetchOptions).then(async (value) => {
            console.log('fetch completed')
            console.log(value)
            await favoriteDataInstance.refreshFavoriteData()
            await favoritePartInstance.refreshFavoriteData()
            refreshFavoriteTab()
        })

    }

    function checkExisitingFavoriteData(button, mediaType, comparisonId) {
        button.textContent = '♡'
        button.classList.add('not-fav')

        if (mediaType == 'song' || mediaType == 'album') {
            for (existingFavorite of favoriteDataInstance.favorite) {
                if (existingFavorite.media_type == mediaType && existingFavorite.media_id == comparisonId) {
                    button.textContent = '♡'
                    button.classList.remove('not-fav')
                    button.classList.add('fav')
                    button.classList.remove('btn-outline-primary')
                    button.classList.add('btn-primary')
                }
            }
        }
    }

    function checkExisitingFavoritePart(button, songId, startTime, endTime) {

        button.textContent = '♡'
        button.classList.add('not-fav')

        if (!favoritePartInstance.favorite) {
            return false
        } else {
            for (existingFavorite of favoritePartInstance.favorite) {
                if (existingFavorite.media_id == songId && existingFavorite.loop_start_time == startTime && existingFavorite.loop_end_time == endTime) {
                    button.textContent = '♡'
                    button.classList.remove('not-fav')
                    button.classList.add('fav')
                    button.classList.remove('btn-outline-primary')
                    button.classList.add('btn-primary')
                }
            }
        }
    }

    // Favorite Button
    function generateFavButton(mediaType, albumId, songId) {
        // Favorite Button for Songs
        const favButton = document.createElement('button');
        favButton.setAttribute('type', 'button');
        favButton.setAttribute('class', 'btn btn-outline-primary btn-sm')
        favButton.setAttribute('media-type', mediaType);
        favButton.setAttribute('album-id', albumId);

        if (mediaType == 'song') {
            favButton.setAttribute('song-id', songId);
        }

        // Update attributes if the media already exists as favorite
        let comparisonId;
        if (mediaType == 'song') {
            comparisonId = songId
        } else if (mediaType == 'album') {
            comparisonId = albumId
        }

        // Define click event
        favButton.addEventListener('click', favButtonClick)

        return favButton
    }

    // Favorite Button
    function generateFavButtonForPart(mediaType, albumId, songId, startTime, endTime) {
        // Favorite Button for Song-part
        const favButton = document.createElement('button');
        favButton.setAttribute('type', 'button');
        favButton.setAttribute('class', 'btn btn-outline-primary btn-sm')
        favButton.setAttribute('media-type', mediaType);
        favButton.setAttribute('album-id', albumId);
        favButton.setAttribute('start-time', startTime);
        favButton.setAttribute('end-time', endTime);

        if (mediaType == 'song-part') {
            favButton.setAttribute('song-id', songId);
            favButton.classList.add('part');
        }

        // Define click event
        favButton.addEventListener('click', favButtonClick)

        return favButton
    }


    // Formatting Media Card
    function createMediaCardLayout() {
        const div1 = document.createElement("div");
        div1.setAttribute('class', 'card mb-3')

        const div2 = document.createElement("div");
        div2.setAttribute('class', 'row g-0')

        const div3_1 = document.createElement("div");
        div3_1.setAttribute('class', 'col-md-2')

        const img = document.createElement("img");

        const div3_2 = document.createElement("div");
        div3_2.setAttribute('class', 'col-md-10')

        const div4 = document.createElement("div");
        div4.setAttribute('class', 'card-body')

        const p = document.createElement("p");
        p.setAttribute('class', 'card-text')

        div4.appendChild(p)
        div3_1.appendChild(img)
        div3_2.appendChild(div4)
        div2.appendChild(div3_1)
        div2.appendChild(div3_2)
        div1.appendChild(div2)

        return div1
    }

    async function itemClickedForPlaying(event) {
        const itemTag = event.target
        const mediaType = itemTag.getAttribute('media-type')

        if (mediaType != 'song-part') {
            looper.switchOff()
        }

        if (music.isPlaying) {
            music.stop()
        }

        // Enqueue the album
        await music.setQueue({
            album: itemTag.getAttribute('album-id')
        })

        // Play the song
        if (mediaType == 'song-part') {
            const startTime = Number(itemTag.getAttribute('start-time'))
            const indexForItem = music.queue.indexForItem(itemTag.getAttribute('song-id'))

            await music.changeToMediaAtIndex(indexForItem)
            await music.seekToTime(startTime)
            await music.play()

            looper.setMediaItem({
                'id': itemTag.getAttribute('song-id'),
                'parentId': itemTag.getAttribute('album-id'),
                'type': itemTag.getAttribute('media-type')
            });

            looper.setStartTime(Number(itemTag.getAttribute('start-time')))
            looper.setEndTime(Number(itemTag.getAttribute('end-time')))
            looper.switchOn()
            console.log(looper)

        } else if (mediaType == 'song') {
            await music.changeToMediaAtIndex(music.queue.indexForItem(itemTag.getAttribute('song-id')))
            await music.play()

        } else if (mediaType == 'album') {
            await music.play()

        }

        // Display
        playPauseButton.textContent = '||'
        mainScreen.setNowPlayingAlbum(await getNowPlayingAlbumInfo(itemTag.getAttribute('album-id')))
        if (mediaType != 'song-part') {
            mainScreen.displayNowPlayingAlbum()
        }
        if (user.authenticated) {
            refreshMainLoopFavButton()
        }
    }

    async function getLoopCards(loopItemList) {
        const containerDiv = document.createElement("div");
        containerDiv.setAttribute('class', 'container');

        const rowDiv = document.createElement("div");
        rowDiv.setAttribute('class', 'row row-cols-3')

        loopItemIdList = []
        for (loopItem of loopItemList) {
            loopItemIdList.push(loopItem.media_id)
        }

        // Bulk search the songs to capture relationships data
        try {
            const queryParameters = { ids: loopItemIdList, l: navigator.language };
            searchedSongs = await music.api.music('/v1/catalog/{{storefrontId}}/songs', queryParameters);

            for (const loopItem of loopItemList) {
                for (const song of searchedSongs.data.data) {
                    if (loopItem.media_id == song.id) {
                        loopItem.songInfo = song
                    }
                }

                if (!loopItem.songInfo) {
                    continue
                }

                // Get Card Layout
                const cardDiv = createMediaCardLayout()
                const artwork = cardDiv.querySelector('img')
                const ptag = cardDiv.querySelector('.card-text')
                const cardBody = cardDiv.querySelector('.card-body')

                // Artwork
                artwork.setAttribute('src', MusicKit.formatArtworkURL(loopItem.songInfo.attributes.artwork, 50, 50))
                artwork.setAttribute('width', '100%')

                // Card Text
                ptag.setAttribute('media-type', 'song-part');
                ptag.setAttribute('start-time', loopItem.loop_start_time)
                ptag.setAttribute('end-time', loopItem.loop_end_time)
                ptag.setAttribute('song-id', loopItem.media_id);
                ptag.setAttribute('album-id', loopItem.songInfo.relationships.albums.data[0].id)
                const node = document.createTextNode(getFormattedTime(loopItem.loop_start_time) + ' - ' + getFormattedTime(loopItem.loop_end_time) + ' - ' + loopItem.songInfo.attributes.name + ' - ' + loopItem.songInfo.attributes.artistName);
                ptag.appendChild(node);
                ptag.addEventListener('click', itemClickedForPlaying)
                if (user.authenticated) {
                    let favButton = generateFavButtonForPart('song-part', loopItem.songInfo.relationships.albums.data[0].id, loopItem.media_id, loopItem.loop_start_time, loopItem.loop_end_time)

                    favButton.setAttribute('start-time', loopItem.loop_start_time)
                    favButton.setAttribute('end-time', loopItem.loop_end_time)


                    // Update attributes if the media already exists as favorite
                    checkExisitingFavoritePart(favButton, loopItem.media_id, loopItem.loop_start_time, loopItem.loop_end_time)

                    // Favorite Button
                    cardBody.appendChild(favButton);
                }
                rowDiv.appendChild(cardDiv);
                containerDiv.appendChild(rowDiv);
            }
            return containerDiv
        } catch (error) {
            console.error(error);
        }
    }

    async function getSongCards(songArray) {
        const containerDiv = document.createElement("div");
        containerDiv.setAttribute('class', 'container');

        const rowDiv = document.createElement("div");
        rowDiv.setAttribute('class', 'row row-cols-3');

        // Bulk search the songs to capture relationships data
        let songIdList = []
        for (const song of songArray) {
            songIdList.push(song.id)
        }
        try {
            const queryParameters = { ids: songIdList, l: navigator.language };
            searchedSongs = await music.api.music('/v1/catalog/{{storefrontId}}/songs', queryParameters);
            for (const song of searchedSongs.data.data) {
                // Get Card Layout
                const cardDiv = createMediaCardLayout()
                const artwork = cardDiv.querySelector('img')
                const ptag = cardDiv.querySelector('.card-text')
                const cardBody = cardDiv.querySelector('.card-body')

                // Artwork
                artwork.setAttribute('src', MusicKit.formatArtworkURL(song.attributes.artwork, 50, 50))
                artwork.setAttribute('width', '100%')

                // Card Text
                ptag.setAttribute('media-type', 'song');
                ptag.setAttribute('song-id', song.id);
                ptag.setAttribute('album-id', song.relationships.albums.data[0].id)
                const node = document.createTextNode(song.attributes.name + ' - ' + song.attributes.artistName);
                ptag.appendChild(node);
                ptag.addEventListener('click', itemClickedForPlaying)

                // Favorite Button
                if (user.authenticated) {
                    let favButton = generateFavButton('song', song.relationships.albums.data[0].id, song.id)
                    checkExisitingFavoriteData(favButton, 'song', song.id)

                    cardBody.appendChild(favButton);
                }

                rowDiv.appendChild(cardDiv);
                containerDiv.appendChild(rowDiv);
            }
            return containerDiv
        } catch (error) {
            console.error(error);
        }
    }


    async function getAlbumCards(albumArray) {
        const containerDiv = document.createElement("div");
        containerDiv.setAttribute('class', 'container');

        const rowDiv = document.createElement("div");
        rowDiv.setAttribute('class', 'row row-cols-3');

        for (const album of albumArray) {

            // Get Card Layout
            const cardDiv = createMediaCardLayout()
            const artwork = cardDiv.querySelector('img')
            const ptag = cardDiv.querySelector('.card-text')
            const cardBody = cardDiv.querySelector('.card-body')

            // Artwork
            artwork.setAttribute('src', MusicKit.formatArtworkURL(album.attributes.artwork, 50, 50))
            artwork.setAttribute('width', '100%')

            // Card Text
            ptag.setAttribute('media-type', 'album');
            ptag.setAttribute('album-id', album.id);
            const node = document.createTextNode(album.attributes.name + ' - ' + album.attributes.artistName);
            ptag.appendChild(node);
            ptag.addEventListener('click', itemClickedForPlaying)
            cardBody.appendChild(ptag);

            // Favorite Button
            if (user.authenticated) {
                let favButton = generateFavButton('album', album.id, null)
                checkExisitingFavoriteData(favButton, 'album', album.id)
                cardBody.appendChild(favButton);
            }

            rowDiv.appendChild(cardDiv);
            containerDiv.appendChild(rowDiv);
        }
        return containerDiv
    }


    async function renderSearchResult(searchResults) {
        // Populate search results on HTML
        let songsDataArray = searchResults.songs ? searchResults.songs.data : null;
        let albumsDataArray = searchResults.albums ? searchResults.albums.data : null;
        let artistsDataArray = searchResults.artists ? searchResults.artists.data : null;

        const wrapperDiv = document.createElement("div")

        // Songs
        if (songsDataArray) {
            const headerSongs = document.createElement("h2");
            headerSongs.textContent = 'Songs';
            wrapperDiv.appendChild(headerSongs);
            wrapperDiv.appendChild(await getSongCards(songsDataArray))
        }

        // Albums
        if (albumsDataArray) {
            const headerAlbums = document.createElement("h2");
            headerAlbums.textContent = 'Albums';
            wrapperDiv.appendChild(headerAlbums);
            wrapperDiv.appendChild(await getAlbumCards(albumsDataArray))
        }

        if (songsDataArray == null && albumsDataArray == null) {
            wrapperDiv.textContent = 'No Matching Content Found'
        }

        mainScreen.setSearchResult(wrapperDiv)
        mainScreen.displaySearchResult()
    }
}).catch((error) => {
    console.log(error)
})