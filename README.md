# justjam
### Guitarists' Pain

If you are a fellow guitarist, you should find yourself often following the steps below:
1. You play the song your are working on.
2. Drag the progress bar to the part you want to practice (usually the solo or the riff).
3. You play along.
4. The solo is done, you click the progress bar to go back to the beginning of the solo.

And you do this dozens of times, until you are satisfied with your playing (congratulations), or your hands get tired and you cannot play anymore, or you have head the same solo too many times for the day and you start thinking that you actually have never liked the solo from the beginning.
We are so used to this, but it is really painful when you have to reach for the mouse or the trackpad every single time just to rewind the song.

### Forget clicking and keep playing

So, I have made a web application that will do the rewinding for you.
It will not just rewind to the beginning of the song. That's useless. 
It will rewind to whatever the second of the song you wish to.

### What justjam does

On _justjam_, you can search for a song, set the starting point and ending point in the song to be looped.
It will rewind to whatever the second of the song you wish to.
And most importantly, you can save those loops as favorites.
So as soon as you grab your guitar, you can just hit that solo on _justjam_ and it will keep replaying that part for you, while you can just focus on playing your instrument. 

### Where it is hosted

You can access this application at:
[https://justjam.jppj.jp/](https://justjam.jppj.jp/)

### Apple Music Authentication Required for Full Experience

As this application uses Apple's MusicKit JS for searching and playing full version of the songs, you will be prompted to log in to your Apple Music account.
Apple Music's authentication is handled completely by the Apple's end, so you don't have to worry about giving up your credentials to _justjam_.

### Technologies Used

#### Front-end
* HTML, CSS(Bootstrap), and vanilla Javascript
* MusicKit JS by Apple
#### Back-end
* Django and Django REST Framework
* MySQL
* Nginx and Gunicorn
* Linux (Ubuntu) Server
