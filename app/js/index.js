'use strict';
const _ = require('lodash');
const queryString = require('query-string');
const request = require("request");
const cheerio = require('cheerio');
const nl2br = require('nl2br');
var SpotifyWebHelper = require('@jonny/spotify-web-helper')
var helper = SpotifyWebHelper()

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
        }
    }
    request(options, callback);
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
            })
        } else {
            lyric_container.innerHTML = "";
            error_container.innerHTML = "No lyrics";
        }
    }
    request(options, callback);
}

// getSpotify();

helper.player.on('ready', () => {
    helper.player.on('track-change', (track) => {
        var artist = helper.status.track.artist_resource.name;
        var song = helper.status.track.track_resource.name;
        song = song.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');
        artist = artist.replace(/ /g, "-").replace('.', '').replace(/\-$/, '');
        search_musix_api(song, artist);
    })
});

process.on('uncaughtException', function(err) {
    error_container.innerHTML = err;
});
