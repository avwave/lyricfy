'use strict';
const _ = require('lodash');
const queryString = require('query-string');
const request = require("request");
const cheerio = require('cheerio');
const nl2br = require('nl2br');
const nodeSpotifyWebHelper = require('node-spotify-webhelper');
const spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

require('dotenv').config();
const MM_apiKey = process.env.MM_API_KEY;

var artist = '';
var song = '';
const base_url = 'https://www.musixmatch.com/lyrics/';
const api_url = 'http://api.musixmatch.com/ws/1.1/';

var error_container = document.getElementById('song_status');
var title_container = document.getElementById('song_title');
var lyric_container = document.getElementById('song_lyrics');
var ext_link = document.getElementById('song_link');

var search_musix_api = (song, artist) => {
    var query = {
        q_track: song,
        q_artist: artist,
        f_has_lyrics: 1,
        apikey: MM_apiKey
    }
    var query_url = `${api_url}track.search?${queryString.stringify(query)}`;
    console.log(query_url);
    var options = {
        url: query_url
    };

    var callback = (error, response, body) => {
        var info = JSON.parse(body);
        var lyric_url = _.get(info, 'message.body.track_list[0].track.track_share_url');
        if (lyric_url != null) {
          getLyrics(song, artist, lyric_url);
        } else {
          wait();
        }
    }
    request(options, callback);
}

var getSpotify = () => {
    spotify.getStatus((err, res) => {
        if (err) {
            error_container.innerHTML = err;
            return;
        }
        var artist = res.track.artist_resource.name;
        var song = res.track.track_resource.name;
        song = song.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');
        artist = artist.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');
        search_musix_api(song, artist);
    })
}

var getNewInfo = () => {
    spotify.getStatus((err, res) => {
        if (err) {
            error_container.innerHTML = err;
            return;
        }
        var artist_new = res.track.artist_resource.name;
        var song_new = res.track.track_resource.name;
        song_new = song_new.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');
        artist_new = artist_new.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');

        if (song_new !== song || artist !== artist_new) {
            search_musix_api(song_new, artist_new);
        }
        wait();
    });
};

var wait = () => {
    setTimeout(getNewInfo, 5000)
}


var getLyrics = (song, artist, url) => {
    title_container.innerHTML = `${artist} - ${song}`;
    ext_link.innerHTML = url;

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36' //To get complete Lyrics
        }
    };

    var callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);            
            $('.mxm-lyrics__content').filter(function() {
                var data = $(this);
                var lyrics = data.text();
                lyric_container.innerHTML = nl2br(lyrics);
                error_container.innerHTML = "";
                wait();
            })
        } else {
            lyric_container.innerHTML = "";
            error_container.innerHTML = "No lyrics";
            wait();
        }
    }
    request(options, callback);
}

getSpotify();

process.on('uncaughtException', function(err) {
    error_container.innerHTML = err;
});
