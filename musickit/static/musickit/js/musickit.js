// Create Promise for document.addEventListener
const setupMusicKit = new Promise((resolve) => {
    document.addEventListener('musickitloaded', function () {
        // MusicKit global is now defined (MusicKit.configure can return a configured MusicKit instance too)
        MusicKit.configure({
            developerToken: 'eyJhbGciOiJFUzI1NiIsImtpZCI6Iks3TEs2TUI2OFEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJaOTlENTc4MjZUIiwiaWF0IjoxNjY3ODkyMzQ3LCJleHAiOjE2NzE0OTYwMjN9.4phAZgovr4TnN68dIiq8N9iC5rG9cFO1w0NovKXqGq_KjaB6BffWMik93jk-5XSbvvC4IQmAM1nXiLvAKhRtxQ',
            app: {
                name: 'My Cool Web App',
                build: '2022.11.17'
            }
        })
        // resolve the Promise with a MusicKit instance
        resolve(MusicKit.getInstance())
    })
});

// Wait till MusicKit.configure gets completed
setupMusicKit.then(async (music) => {
    music.player.volume = 0.8;

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
    // Info Display
    let artworkImg = document.getElementById('artwork');
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



    // async function getFavoriteJson() {
    //     let fetchResponse = await fetch('http://localhost:8000/api/favorite/item')
    //     return fetchResponse.json()
    // }

    // let favoriteList = await getFavoriteJson()


    // Favorite Class
    class FavoriteItem {
        constructor(){
            this.favorite = null
        };

        async refreshFavoriteData(){
            let fetchResponse = await fetch('http://localhost:8000/api/favorite/item')
            this.favorite = await fetchResponse.json()
        };
    }

    let favoriteDataInstance = new FavoriteItem()
    await favoriteDataInstance.refreshFavoriteData()

    // Initialize Favorite Tab
    async function refreshFavoriteTab() {
        // fetch('http://localhost:8000/api/favorite/item').then((value) => {
        //     console.log('fetch completed')
        //     return value.json()
        // }).then(async (favoriteArray) => {
        //     console.log(favoriteArray)

            songIdList = []
            albumIdList = []
            for (favorite of favoriteDataInstance.favorite) {
                if (favorite.media_type == 'song') {
                    songIdList.push(favorite.media_id)
                } else if (favorite.media_type == 'album') {
                    albumIdList.push(favorite.media_id)
                }
            }

            console.log(songIdList.length)
            console.log(albumIdList.length)
            const wrapperDiv = document.createElement("div")

            if (songIdList.length > 0) {
                const headerSongs = document.createElement("h2");
                headerSongs.textContent = 'Songs';
                wrapperDiv.appendChild(headerSongs);

                searchedSongs = await music.api.songs(songIdList)
                wrapperDiv.appendChild(await getSongList(searchedSongs))
            }

            if (albumIdList.length > 0) {
                const headerAlbums = document.createElement("h2");
                headerAlbums.textContent = 'Albums';
                wrapperDiv.appendChild(headerAlbums);

                searchedAlbums = await music.api.albums(albumIdList)
                wrapperDiv.appendChild(await getAlbumList(searchedAlbums))
            }

            mainScreen.setFavorite(wrapperDiv)
    //     })
    }
    refreshFavoriteTab()

    let favoriteTabLink = document.getElementById('favorite-tab');

    favoriteTabLink.addEventListener('click', () => {
        mainScreen.displayFavorite()
    })

    music.addEventListener('mediaItemDidChange', () => {
        songName.textContent = music.player.nowPlayingItem.title
        currentAlgumInfo.textContent = music.player.nowPlayingItem.artistName + ' | ' + music.player.nowPlayingItem.albumName
        artworkImg.setAttribute('src', MusicKit.formatArtworkURL(music.player.nowPlayingItem.attributes.artwork, 100, 100))

        let seconds = ((music.player.currentPlaybackDuration % 60) < 10 ? '0' : '') + (music.player.currentPlaybackDuration % 60);
        let minutes = (MusicKit.formattedSeconds(music.player.currentPlaybackDuration).minutes < 10 ? '0' : '') + MusicKit.formattedSeconds(music.player.currentPlaybackDuration).minutes;
        let hours = MusicKit.formattedSeconds(music.player.currentPlaybackDuration).hours;

        let durationString = hours >= 1 ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
        playbackDuration.textContent = durationString;

        // Reset loop segment
        looperStartDotPos.style.left = '0%';
        looperEndDotPos.style.left = '100%';
        looper.setStartTime(0);
        looper.setEndTime(music.player.currentPlaybackDuration);
        looper.setMediaItem({
            'id': music.player.nowPlayingItem.id,
            'type': music.player.nowPlayingItem.type
        });
    })

    music.addEventListener('playbackTimeDidChange', async () => {
        // Check Looper
        if (looper.isOn && music.player.currentPlaybackTime < looper.startTime) {
            await music.player.seekToTime(looper.startTime)
        } else if (looper.isOn && music.player.currentPlaybackTime >= looper.endTime) {
            await music.player.seekToTime(looper.startTime)
        }

        // Time Display
        let seconds = ((music.player.currentPlaybackTime % 60) < 10 ? '0' : '') + (music.player.currentPlaybackTime % 60);
        let minutes = (MusicKit.formattedSeconds(music.player.currentPlaybackTime).minutes < 10 ? '0' : '') + MusicKit.formattedSeconds(music.player.currentPlaybackTime).minutes;
        let hours = MusicKit.formattedSeconds(music.player.currentPlaybackTime).hours;

        let playbackTimeString = music.player.currentPlaybackDuration >= 3600 ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
        playbackTime.textContent = playbackTimeString;

        let portionPlayed = music.player.currentPlaybackTime / music.player.currentPlaybackDuration;
        let pixedToBeColored = Math.floor(portionPlayed * timeScope.offsetWidth);
        timeScopeAfter.style.width = pixedToBeColored + 'px';
        timeScopeDotPos.style.left = pixedToBeColored + 'px';
    })

    music.addEventListener('playbackStateDidChange', () => {
        if (music.player.playbackState == 10) {
            playPauseButton.textContent = '▶︎'
        }
    })


    music.addEventListener('playbackVolumeDidChange', () => {
        let pixedToBeColored = Math.floor(music.player.volume * volumeScope.offsetWidth);
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
            music.player.volume = volumeInDecimal
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
            music.player.volume = volumeInDecimal
        }
    })

    let playPauseButton = document.getElementById('play-pause');
    let previousButton = document.getElementById('previous-item');
    let nextButton = document.getElementById('next-item');
    let rewindButton = document.getElementById('rewind');
    let fastForwardButton = document.getElementById('fast-forward');
    let backToStartButton = document.getElementById('back-to-start');

    // Click Control on the Player Progress
    timeScope.addEventListener('click', async (e) => {
        let barWidth = timeScope.offsetWidth;
        let clickedSpot = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
        let clickedSpotInSeconds = Math.floor(clickedSpot / barWidth * music.player.currentPlaybackDuration)
        await music.player.seekToTime(clickedSpotInSeconds)
    })

    timeScopeDot.addEventListener('dragend', async (e) => {
        let barWidth = timeScope.offsetWidth;
        let cursorLocation = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
        let duration = music.player.currentPlaybackDuration;
        let clickedSpotInSeconds = Math.round(cursorLocation / barWidth * duration)
        timeScopeDotPos.style.left = cursorLocation + 'px'

        let destinationTime;
        if (clickedSpotInSeconds < 0) {
            destinationTime = 0
        } else if (clickedSpotInSeconds > duration) {
            destinationTime = duration
        } else {
            destinationTime = clickedSpotInSeconds
        }
        await music.player.seekToTime(destinationTime)
    })

    playPauseButton.addEventListener('click', function () {
        if (music.player.isPlaying) {
            music.player.pause();
            playPauseButton.textContent = '▶︎'
        } else {
            music.player.play();
            playPauseButton.textContent = '⏸'
        }
    })

    rewindButton.addEventListener('click', function () {
        let destination;
        if (music.player.currentPlaybackTime <= 5) {
            destination = 0;
        } else {
            destination = music.player.currentPlaybackTime - 5;
        }
        music.player.seekToTime(destination)
    });

    fastForwardButton.addEventListener('click', function () {
        let destination;
        if (music.player.currentPlaybackTime + 5 >= music.player.currentPlaybackDuration) {
            destination = music.player.currentPlaybackDuration
        } else {
            destination = music.player.currentPlaybackTime + 5;
        }
        music.player.seekToTime(destination);
    });


    backToStartButton.addEventListener('click', function () {
        music.player.seekToTime(0);
    });

    // Looper
    class Looper {
        constructor() {
            this.isOn = false;
            this.startTime = 0;
            this.endTime = 0;
            this.mediaItem = null;
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
        setStartTime(startAt) {
            if (startAt > this.endTime) {
                this.endTime = startAt;
            }
            this.startTime = startAt;
        };
        setEndTime(endAt) {
            if (endAt > this.startTime) {
                this.endTime = endAt;
            } else if (this.isOn == true) {
                console.log('End time must be larger than start time.')
            }

        };
        setMediaItem(item) {
            this.mediaItem = item
        }
    };

    let looper = new Looper();

    let looperStartDotPos = document.getElementById('looper-start-dot-position');
    let looperStartDot = document.getElementById('looper-start-dot');
    let looperEndDotPos = document.getElementById('looper-end-dot-position');
    let looperEndDot = document.getElementById('looper-end-dot');
    let favoriteButton = document.getElementById('favorite');

    looperStartDot.addEventListener('dragend', async (e) => {
        let barWidth = timeScope.offsetWidth;
        let cursorLocation = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
        let duration = music.player.currentPlaybackDuration;
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
        await music.player.seekToTime(looper.startTime)
    })

    looperEndDot.addEventListener('dragend', (e) => {
        let barWidth = timeScope.offsetWidth;
        let cursorLocation = Math.floor(e.clientX - timeScope.getBoundingClientRect().left);
        let duration = music.player.currentPlaybackDuration;
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
    })

    let looperSwitch = document.getElementById('looper-switch');
    looperSwitch.addEventListener('click', () => {
        looper.looperSwitch()
        if (looper.isOn) {
            looperSwitch.textContent = 'Looper Off'
            looperStartDot.style.display = 'inline-block'
            looperEndDot.style.display = 'inline-block'
            favoriteButton.style.display = 'inline-block'
        } else {
            looperSwitch.textContent = 'Looper On'
            looperStartDot.style.display = 'none'
            looperEndDot.style.display = 'none'
            favoriteButton.style.display = 'none'
        }
    });

    favoriteButton.addEventListener('click', () => {
        console.log(looper)
    });

    // Previous and Next
    previousButton.addEventListener('click', function () {
        music.player.skipToPreviousItem();
    });

    nextButton.addEventListener('click', function () {
        music.player.skipToNextItem();
    });


    // Search Bar and Search Result
    let searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keypress', runSearch);
    console.log('runSearch added to searchBar')
    // let searchResultSongs = document.getElementById('search-result-songs');
    // let searchResultAlbums = document.getElementById('search-result-albums');




    // Now-playin Album Info for MainScreen Class
    async function getNowPlayingAlbumInfo(albumId) {

        const wrapperDiv = document.createElement("div");

        // Get album tracks
        let albumData = await music.api.album(albumId)
        let albumTracks = albumData.relationships.tracks.data

        const headerNowPlayingAlbum = document.createElement("h2");
        headerNowPlayingAlbum.textContent = 'Now Playing Album';
        wrapperDiv.appendChild(headerNowPlayingAlbum);

        const headerNowPlayingAlbumInfo = document.createElement("h3");
        headerNowPlayingAlbumInfo.textContent = albumData.attributes.name + ' | ' + albumData.attributes.artistName;
        wrapperDiv.appendChild(headerNowPlayingAlbumInfo);

        for (const track of albumTracks) {
            const para = document.createElement("p");
            para.setAttribute('class', 'song');
            para.setAttribute('song-id', track.attributes.playParams.id);
            para.setAttribute('album-id', albumId)
            para.setAttribute('id', track.attributes.playParams.id)
            const node = document.createTextNode(track.attributes.trackNumber + ': ' + track.attributes.name);
            para.appendChild(node);

            para.addEventListener('click', async (e) => {
                await music.changeToMediaAtIndex(music.player.queue.indexForItem(e.target.getAttribute('song-id')))
                playPauseButton.textContent = '⏸'
            })
            wrapperDiv.appendChild(para)
        }
        return wrapperDiv
    }


    function generateFavButton(mediaType, albumId, songId) {
        // Favorite Button for Songs
        const favButton = document.createElement('button');

        let comparisonId;
        if (mediaType == 'song') {
            comparisonId = songId
        } else if (mediaType == 'album') {
            comparisonId = albumId
        }

        for (existingFavorite of favoriteDataInstance.favorite) {
            if (existingFavorite.media_type == mediaType && existingFavorite.media_id == comparisonId) {

                favButton.textContent = 'Remove from Favorite'
                favButton.classList.remove('not-fav')
                favButton.classList.add('fav')
                break
            } else {
                favButton.textContent = 'Add to Favorite'
                favButton.classList.remove('fav')
                favButton.classList.add('not-fav')
            }
        }

        favButton.setAttribute('media-type', mediaType);
        favButton.setAttribute('album-id', albumId);
        

        if (mediaType == 'song') {
            favButton.setAttribute('song-id', songId);
        }

        favButton.addEventListener('click', (e) => {
            console.log('favButton clicked')

            let mediaType = e.target.getAttribute('media-type');
            let mediaId;

            if (mediaType == 'song') {
                mediaId = e.target.getAttribute('song-id');
            } else if (mediaType == 'album') {
                mediaId = e.target.getAttribute('album-id');
            }

            let fetchOptions;
            if (e.target.getAttribute('class') == 'not-fav'){
                // Adding to Favorite
                console.log('Requested to Add')
                fetchOptions = {
                    method: 'POST',
                    headers: {
                        "X-CSRFToken": getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'media_type': mediaType,
                        'media_id': mediaId
                    })
                }
                favButton.classList.remove('not-fav')
                favButton.classList.add('fav')
                e.target.textContent = 'Remove from Favorite'

            } else if (e.target.getAttribute('class') == 'fav'){
                // Removing from Favorite
                console.log('Requested to Remove')
                fetchOptions = {
                    method: 'DELETE',
                    headers: {
                        "X-CSRFToken": getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'media_type': mediaType,
                        'media_id': mediaId
                    })
                }
                favButton.classList.remove('fav')
                favButton.classList.add('not-fav')
                e.target.textContent = 'Add to Favorite'
            }

            fetch('http://localhost:8000/api/favorite/item', fetchOptions).then(async (value) => {
                console.log('fetch completed')
                console.log(value)
                await favoriteDataInstance.refreshFavoriteData()
                refreshFavoriteTab()
            })

        })

        return favButton
    }


    async function getSongList(songArray) {
        const wrapperDiv = document.createElement("div");

        // Bulk search the songs to capture relationships data
        let songIdList = []
        for (const song of songArray) {
            songIdList.push(song.id)
        }
        searchedSongs = await music.api.songs(songIdList)

        for (const song of searchedSongs) {
            const divtag = document.createElement("div");

            const ptag = document.createElement("p");
            ptag.setAttribute('class', 'song');
            ptag.setAttribute('song-id', song.id);
            ptag.setAttribute('album-id', song.relationships.albums.data[0].id)
            const node = document.createTextNode(song.attributes.name + ' - ' + song.attributes.albumName);
            ptag.appendChild(node);
            ptag.addEventListener('click', async (e) => {
                await music.setQueue({
                    album: e.target.getAttribute('album-id'),
                    // startPosition: e.target.getAttribute('queue-index')
                })
                await music.changeToMediaAtIndex(music.player.queue.indexForItem(e.target.getAttribute('song-id')))
                playPauseButton.textContent = '⏸'

                mainScreen.setNowPlayingAlbum(await getNowPlayingAlbumInfo(e.target.getAttribute('album-id')))
                mainScreen.displayNowPlayingAlbum()
            })
            divtag.appendChild(ptag);

            // Populate Favorite Button
            divtag.appendChild(generateFavButton('song', song.relationships.albums.data[0].id, song.id));

            wrapperDiv.appendChild(divtag);
        }
        return wrapperDiv
    }

    async function getAlbumList(albumArray) {
        const wrapperDiv = document.createElement("div");

        for (const album of albumArray) {
            const divtag = document.createElement("div");
            const ptag = document.createElement("p");
            ptag.setAttribute('class', 'album');
            ptag.setAttribute('album-id', album.id);
            const node = document.createTextNode(album.attributes.name + ' - ' + album.attributes.artistName);
            ptag.appendChild(node);
            ptag.addEventListener('click', async (e) => {
                await music.setQueue({
                    album: e.target.getAttribute('album-id')
                })
                await music.play()
                playPauseButton.textContent = '⏸'

                mainScreen.setNowPlayingAlbum(await getNowPlayingAlbumInfo(e.target.getAttribute('album-id')))
                mainScreen.displayNowPlayingAlbum()
            })
            divtag.appendChild(ptag);
            // Populate Favorite Button
            divtag.appendChild(generateFavButton('album', album.id, null));

            wrapperDiv.appendChild(divtag);
        }
        return wrapperDiv
    }

    async function runSearch(e) {
        if (e.key == 'Enter') {
            console.log('entered runSearch')
            // Format search query and request API
            let searchString = searchBar.value.replace(' ', '+').replace('　', '+');
            searchResultData = await music.api.search(searchBar.value)
            console.log(searchResultData)

            // Populate search results on HTML
            let songsDataArray = searchResultData.songs ? searchResultData.songs.data : null;
            let albumsDataArray = searchResultData.albums ? searchResultData.albums.data : null;
            let artistsDataArray = searchResultData.artists ? searchResultData.artists.data : null;

            const wrapperDiv = document.createElement("div")

            // Songs
            if (songsDataArray.length > 0) {
                console.log(songsDataArray)
                const headerSongs = document.createElement("h2");
                headerSongs.textContent = 'Songs';
                wrapperDiv.appendChild(headerSongs);
                wrapperDiv.appendChild(await getSongList(songsDataArray))
            }

            // Albums
            if (albumsDataArray.length > 0) {
                console.log(albumsDataArray)
                const headerAlbums = document.createElement("h2");
                headerAlbums.textContent = 'Albums';
                wrapperDiv.appendChild(headerAlbums);
                wrapperDiv.appendChild(await getAlbumList(albumsDataArray))
            }

            if (songsDataArray == null && albumsDataArray == null) {
                wrapperDiv.textContent = 'No Matching Content Found'
            }
            mainScreen.setSearchResult(wrapperDiv)
            mainScreen.displaySearchResult()
        }
    }


})
