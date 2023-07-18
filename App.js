//global reference to elements
const MUSIC_TABLE = document.querySelector('.table');
const MUSIC_TABLE_BODY = document.querySelector('.music');

//fetch request to get access token
async function fetchAccessToken() {
    //spotify IDs to get access token
    const CLIENT_ID = "46824a68ac144d5d9d07248db6a4ce2f";
    const CLIENT_SECRET = "0ec6cc4c3df84606aa27cc3e43d80816";
    const OPTIONS = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: "grant_type=client_credentials"
    };
    try{
        const response = await fetch("https://accounts.spotify.com/api/token", OPTIONS);
        const data =  await response.json();
        return data.access_token;
    } catch (error){
        console.error(error);
        warningMsg("Sorry. There was a problem reaching Spotify. Please try again later.")
    }
}

//fetch request to get data from api
async function fetchAPI(token, endpoint, method) {
    try{
        const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
            method,
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        const data = await response.json();
        return data;
    } catch(error){
        console.error(error);
        warningMsg("Sorry. There was a problem reaching Spotify. Please try again later.");
    }
}

//grab relevant info from returned data and pass to display function
function formatData(tracks){
    var formatedTracks = [];
    for(let i=0; i < tracks.length; i++){
        const obj = {};
        //format time as 00:00
        const minutes = Math.floor(tracks[i].duration_ms / 1000 / 60);
        const seconds = Math.floor(tracks[i].duration_ms / 1000 % 60);
        const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const duration = `${minutes}:${paddedSeconds}`;
        //map over artist array
        obj.Artists = tracks[i].artists.map(
            ({external_urls: {spotify: url}, id, name}) => ({
                url,
                id,
                name
            })
        );
        obj.AlbumName = tracks[i].album.name;
        obj.AlbumUrl = tracks[i].album.external_urls.spotify;
        obj.TrackName = tracks[i].name;
        obj.TrackUrl = tracks[i].external_urls.spotify;
        obj.TrackId = tracks[i].id;
        obj.Duration = duration;
        obj.TrackPreview = tracks[i].preview_url;
        obj.Image = tracks[i].album.images[2].url;
        formatedTracks.push(obj);
    }
    //console.log(formatedTracks);
    return formatedTracks;
}

//media control
function playMusic(song){
    //check if other tracks are playing and pause them
    const AUDIO_PLAYERS = document.querySelectorAll("audio");
    for(let i = 0; i < AUDIO_PLAYERS.length; i++){
        let changeBtn = document.querySelector("#playPauseBtn" + i);
        if(!AUDIO_PLAYERS[i].paused){
            AUDIO_PLAYERS[i].pause();
            changeBtn.classList.remove("fa-pause");
            changeBtn.classList.add("fa-play");
        }
    } 
    song.load();
    song.play();  
}

function playPauseMusic(index, track){
    if(track === "null"){
        warningMsg("No track preview");
        return
    }
    const SONG = document.querySelector("#track" + index);
    const PLAY_PAUSE_BTN = document.querySelector("#playPauseBtn" + index);
    
    if(PLAY_PAUSE_BTN.classList.contains("fa-play")){
        playMusic(SONG);
        PLAY_PAUSE_BTN.classList.remove("fa-play");
        PLAY_PAUSE_BTN.classList.add("fa-pause");
    } else {
        SONG.pause();
        PLAY_PAUSE_BTN.classList.remove("fa-pause");
        PLAY_PAUSE_BTN.classList.add("fa-play");
    }
}

//create Spotify playlist
async function createPlaylist(ACCESS_TOKEN, recs){
    alert("This function is currently under development.");
    return
    const musicArr = formatData(recs);
    console.log(musicArr);
    const tracksUri = [];
    for(i=0; i < musicArr.length; i++){
        const uri = `spotify:track:${musicArr[i].TrackId}`;
        tracksUri.push(uri);
    }
    const { id: user_id } = await fetchAPI(ACCESS_TOKEN, 'me', 'GET');
    const playlist = await fetchAPI(ACCESS_TOKEN,
        `v1/users/${user_id}/playlists`, {
          "name": `My recommendation playlist`,
          "description": `Playlist created by Hipsterfy`,
          "public": false
      }, 'POST');
    await fetchAPI(ACCESS_TOKEN, `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`, 'POST');
}

//create table rows and add to table
function displayMusic(musicArr){
    for(let i=0; i<musicArr.length; i++){
        var newRow = document.createElement("tr");
        var rowContent = `<td class="idCell">
                            <p class="trackId">${i+1}</p>  
                            <audio id="track${i}">
                                <source src="${musicArr[i].TrackPreview}" type="audio/mpeg">
                            </audio>
                            <i class="fa-solid fa-play playPauseBtn" id="playPauseBtn${i}" onclick="playPauseMusic('${i}','${musicArr[i].TrackPreview}')"></i>
                          </td> 
                          </td>
                          <td class="musicPlayer">
                            <img src="${musicArr[i].Image}" class="trackArt">
                          <td class="trackCell">
                            <div class="trackInfo">
                                <p class="trackName">
                                    <a href="${musicArr[i].TrackUrl}" target="_blank">${musicArr[i].TrackName} </a>
                                </p> 
                                <p class="artistName">
                                    <a href="${musicArr[i].Artists[0].url}" target="_blank">${musicArr[i].Artists[0].name} </a>
                                </p>
                            </div>
                          </td>
                          <td class="albumCell">
                            <p>
                                <a href="${musicArr[i].AlbumUrl}" target="_blank">${musicArr[i].AlbumName} </a>
                            </p>
                          </td>
                          <td class="durationCell">
                            <p>${musicArr[i].Duration}</p>
                          </td>`;
        newRow.innerHTML = rowContent;
        MUSIC_TABLE_BODY.appendChild(newRow);
    }
}

//pop up warning in case of error
function warningMsg(errorMsg){
    const WARNING_DIV = document.querySelector(".warning");
    const CLOSE_BTN = document.querySelector(".fa-x");
    var newPara = document.createElement("p");
    newPara.innerHTML = errorMsg;
    WARNING_DIV.appendChild(newPara);
    WARNING_DIV.style.display = "flex";

    CLOSE_BTN.addEventListener('click', () => {
        WARNING_DIV.removeChild(newPara);
        WARNING_DIV.style.display = "none";
    })
}

async function main(){
    const ACCESS_TOKEN = await fetchAccessToken();
    const BTN = document.querySelector(".btn");
    const PLAYLIST_BTN = document.querySelector('.playlist');
    const TEXT_INPUT = document.querySelector("#textInput");
    var artistId = "";
    var artistGenres = [];
    var rec = {};

    BTN.addEventListener('click', async() => {
        MUSIC_TABLE.classList.remove('show');
        MUSIC_TABLE_BODY.replaceChildren();
        var query = TEXT_INPUT.value;
        if(!query){
            warningMsg("Please enter an artist to search for");
            return;
        } else{
            const MUSIC = await fetchAPI(ACCESS_TOKEN, `search?q=${query}&type=artist&limit=1`,'GET');
            //console.log(MUSIC);
            artistId = MUSIC.artists.items[0].id; 
            artistGenres = MUSIC.artists.items[0].genres;
            //limit search to just 4 genres
            if (artistGenres.length <= 4){
                rec = await fetchAPI(ACCESS_TOKEN, `recommendations?limit=10&seed_artists=${artistId}&seed_genres=${artistGenres.join()}&max_popularity=25&min_popularity=10`, 'GET');
                const formatedTracks = formatData(rec.tracks);
                displayMusic(formatedTracks);
            } else{
                let newArtistGenres = [];
                for (let i=0; i<4; i++){
                    newArtistGenres.push(artistGenres[i]);
                }
                rec = await fetchAPI(ACCESS_TOKEN, `recommendations?limit=10&seed_artists=${artistId}&seed_genres=${newArtistGenres.join()}&max_popularity=25&min_popularity=10`, 'GET');
                const formatedTracks = formatData(rec.tracks);
                displayMusic(formatedTracks);
            }
        }
        MUSIC_TABLE.classList.add('show');
        PLAYLIST_BTN.classList.add('show');
    })

    PLAYLIST_BTN.addEventListener('click', () => createPlaylist(ACCESS_TOKEN, rec));

}

main();
