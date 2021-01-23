"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deezer = void 0;
const erela_js_1 = require("erela.js");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://api.deezer.com';
const REGEX = /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist))\/(\d+)/;
const buildSearch = (loadType, tracks, error, name) => ({
    loadType: loadType,
    tracks: tracks !== null && tracks !== void 0 ? tracks : [],
    playlist: name ? {
        name,
        duration: tracks
            .reduce((acc, cur) => acc + (cur.duration || 0), 0),
    } : null,
    exception: error ? {
        message: error,
        severity: "COMMON"
    } : null,
});
const check = (options) => {
    if (!options)
        throw new TypeError("DeezerOptions must not be empty.");
    if (typeof options.convertUnresolved !== "undefined" &&
        typeof options.convertUnresolved !== "boolean")
        throw new TypeError('Deezer option "convertUnresolved" must be a boolean.');
    if (typeof options.playlistLimit !== "undefined" &&
        typeof options.playlistLimit !== "number")
        throw new TypeError('Deezer option "playlistLimit" must be a number.');
    if (typeof options.albumLimit !== "undefined" &&
        typeof options.albumLimit !== "number")
        throw new TypeError('Deezer option "albumLimit" must be a number.');
};
class Deezer extends erela_js_1.Plugin {
    constructor(options) {
        super();
        check(options);
        this.options = Object.assign({}, options);
        this.functions = {
            track: this.getTrack.bind(this),
            album: this.getAlbumTracks.bind(this),
            playlist: this.getPlaylistTracks.bind(this),
        };
    };
    load(manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }
    search(query, requester) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const finalQuery = query.query || query;
            const [, type, id] = (_a = finalQuery.match(REGEX)) !== null && _a !== void 0 ? _a : [];
            if (type in this.functions) {
                try {
                    const func = this.functions[type];
                    if (func) {
                        const data = yield func(id);
                        const loadType = type === "track" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                        const name = ["playlist", "album"].includes(type) ? data.name : null;
                        const tracks = data.tracks.map(query => {
                            const track = erela_js_1.TrackUtils.buildUnresolved(query, requester);
                            if (this.options.convertUnresolved)
                                track.resolve();
                            return track;
                        });
                        return buildSearch(loadType, tracks, null, name);
                    }
                    const msg = 'Incorrect type for Deezer URL, must be one of "track", "album" or "playlist".';
                    return buildSearch("LOAD_FAILED", null, msg, null);
                }
                catch (e) {
                    return buildSearch((_b = e.loadType) !== null && _b !== void 0 ? _b : "LOAD_FAILED", null, (_c = e.message) !== null && _c !== void 0 ? _c : null, null);
                };
            };
            return this._search(query, requester);
        });
    };
    getAlbumTracks(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: album } = yield axios_1.default.get(`${BASE_URL}/album/${id}`);
            const tracks = album.tracks.data.map(item => Deezer.convertToUnresolved(item));
            return { tracks, name: album.title };
        });
    };
    getPlaylistTracks(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: playlist } = yield axios_1.default.get(`${BASE_URL}/playlist/${id}`);
            const tracks = playlist.tracks.data.map(item => Deezer.convertToUnresolved(item));
            return { tracks, name: playlist.title };
        });
    };
    getTrack(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${BASE_URL}/track/${id}`);
            const track = Deezer.convertToUnresolved(data);
            return { tracks: [track] };
        });
    };
    static convertToUnresolved(track) {
        if (!track)
            throw new ReferenceError("The Deezer track object was not provided");
        if (!track.artist)
            throw new ReferenceError("The track artist array was not provided");
        if (!track.title)
            throw new ReferenceError("The track title was not provided");
        if (!Array.isArray(track.artist))
            throw new TypeError(`The track artist must be an array, received type ${typeof track.artist}`);
        if (typeof track.title !== "string")
            throw new TypeError(`The track title must be a string, received type ${typeof track.name}`);
        return {
            title: track.title,
            author: track.artist.name,
            duration: track.duration * 1000,
        };
    }
};
exports.Deezer = Deezer;