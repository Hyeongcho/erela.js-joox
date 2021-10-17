import { Manager, Plugin, UnresolvedTrack, UnresolvedQuery } from "erela.js";
export declare class Joox extends Plugin {
    private _search;
    private manager;
    private readonly functions;
    private readonly options;
    constructor(options: JooxOptions);
    load(manager: Manager): void;
    private search;
    private getAlbumTracks;
    private getPlaylistTracks;
    private getTrack;
    private static convertToUnresolved;
}
export interface JooxOptions {
    /** Amount of pages to load, each page having 100 tracks. */
    playlistLimit?: number;
    /** Amount of pages to load, each page having 50 tracks. */
    albumLimit?: number;
    /**
     * Whether to convert UnresolvedTracks to Track. Defaults to false.
     * **Note: This is** ***not*** **recommended as it spams YouTube and takes a while if a large playlist is loaded.**
     */
    convertUnresolved?: boolean;
}
export interface Result {
    tracks: UnresolvedQuery[];
    name?: string;
}
export interface Album {
    name: string;
    tracks: AlbumTracks;
}
export interface AlbumTracks {
    items: JooxTrack[];
    next: string | null;
}
export interface Artist {
    name: string;
}
export interface Playlist {
    tracks: PlaylistTracks;
    name: string;
}
export interface PlaylistTracks {
    items: [
        {
            track: JooxTrack;
        }
    ];
    next: string | null;
}
export interface JooxTrack {
    artists: Artist[];
    name: string;
    duration_ms: number;
}
export interface SearchResult {
    exception?: {
        severity: string;
        message: string;
    };
    loadType: string;
    playlist?: {
        duration: number;
        name: string;
    };
    tracks: UnresolvedTrack[];
}
