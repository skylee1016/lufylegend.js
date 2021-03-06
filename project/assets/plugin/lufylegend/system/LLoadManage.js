
import { getExtension } from '../utils/Function';
import LURLLoader from '../net/LURLLoader';
import LFontLoader from '../net/LFontLoader';
import LLoader from '../display/LLoader';
import lufylegend from '../ll';
class LLoadManage extends lufylegend.LEventDispatcher {
    constructor() {
        super();
        this.llname = 'll.file.';
        this.llload = 'll.load.';
    }
    load(l, u, c) {
        let s = this;
        if (!l || l.length === 0) {
            let event = new lufylegend.LEvent(lufylegend.LEvent.COMPLETE);
            event.currentTarget = s;
            event.target = {};
            s.dispatchEvent(event);
            return;
        }
        s.list = l, s.onupdate = u, s.oncomplete = c;
        s.loader = s, s.index = 0, s.loadIndex = 0, s.result = [], s.lresult = [];
        s.loadInit();
    }
    loadInit() {
        let s = this;
        if (s.index >= s.list.length) {
            return;
        }
        s.loadIndex = 0;
        s.loadStart();
        s.reloadtime = setTimeout(s.loadInit.bind(s), 10000);
    }
    loadStart() {
        let s = this, d, ext;
        if (s.loadIndex >= s.list.length) {
            return;
        }
        d = s.list[s.loadIndex];
        if (typeof d.progress === 'undefined') {
            d.progress = 0;
        }
        if (!d.name) {
            d.name = s.llname + s.loadIndex;
        }
        if (!s.lresult[s.llload + d.name]) {
            if (!d['type']) {
                ext = getExtension(d.path);
                if (ext === 'txt') {
                    d['type'] = LURLLoader.TYPE_TEXT;
                } else if (ext === 'js') {
                    d['type'] = LURLLoader.TYPE_JS;
                } else if ((new Array('mp3', 'ogg', 'wav', 'm4a')).indexOf(ext) >= 0) {
                    d['type'] = lufylegend.LSound.TYPE_SOUND;
                }
            }
            if (d['type'] === LURLLoader.TYPE_TEXT || d['type'] === LURLLoader.TYPE_JS) {
                s.loader = new LURLLoader();
                s.loader.parent = s;
                s.loader.name = d.name;
                s.loader.addEventListener(lufylegend.LEvent.PROGRESS, s._loadProgress);
                s.loader.addEventListener(lufylegend.LEvent.ERROR, s._loadError);
                s.loader.addEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
                s.loader.load(s.url(d.path), d['type']);
            } else if (d['type'] === lufylegend.LSound.TYPE_SOUND) {
                s.loader = new lufylegend.LSound();
                s.loader.parent = s;
                s.loader.name = d.name;
                s.loader.addEventListener(lufylegend.LEvent.PROGRESS, s._loadProgress);
                s.loader.addEventListener(lufylegend.LEvent.ERROR, s._loadError);
                s.loader.addEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
                if (lufylegend.LSound.webAudioEnabled || lufylegend.LGlobal.wx) {
                    s.loader.load(d.path);
                } else {
                    lufylegend.LSound.addWait(s.loader, d.path);
                    s.loader.dispatchEvent(lufylegend.LEvent.COMPLETE);
                }
            } else if (d['type'] === lufylegend.LAtlas.TYPE_PLIST) {
                s.loader = new lufylegend.LAtlas();
                s.loader.parent = s;
                s.loader.name = d.name;
                s.loader.addEventListener(lufylegend.LEvent.PROGRESS, s._loadProgress);
                s.loader.addEventListener(lufylegend.LEvent.ERROR, s._loadError);
                s.loader.addEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
                s.loader.load(d.path, d.name);
            } else if (d['type'] === LFontLoader.TYPE_FONT) {
                s.loader = new LFontLoader();
                s.loader.parent = s;
                s.loader.name = d.name;
                s.loader.addEventListener(lufylegend.LEvent.ERROR, s._loadError);
                s.loader.addEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
                s.loader.load(d.path, d.name);
            } else {
                s.loader = new LLoader();
                s.loader.parent = s;
                s.loader.name = d.name;
                s.loader.addEventListener(lufylegend.LEvent.PROGRESS, s._loadProgress);
                s.loader.addEventListener(lufylegend.LEvent.ERROR, s._loadError);
                s.loader.addEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
                s.loader.load(s.url(d.path), LLoader.TYPE_BITMAPDATE, d.useXHR);
            }
            s.loader._loadIndex = s.loadIndex;
        }
        s.loadIndex++;
        s.loadStart();
    }
    _loadProgress(e) {
        let loader = e.currentTarget;
        let s = loader.parent;
        let d = s.list[loader._loadIndex];
        d.progress = e.loaded / e.total;
        let progress = 0;
        for (let i = 0, l = s.list.length;i < l;i++) {
            progress += s.list[i].progress;
        }
        let event = new lufylegend.LEvent(lufylegend.LEvent.PROGRESS);
        event.currentTarget = s;
        event.target = e.currentTarget;
        event.loaded = progress;
        event.total = s.list.length;
        event.responseURL = e.responseURL;
        s.dispatchEvent(event);
    }
    _loadError(e) {
        let loader = e.currentTarget;
        let s = loader.parent;
        delete loader.parent;
        loader.removeEventListener(lufylegend.LEvent.ERROR, s._loadError);
        let event = new lufylegend.LEvent(lufylegend.LEvent.ERROR);
        event.currentTarget = s;
        event.target = e.target;
        event.responseURL = e.responseURL;
        s.dispatchEvent(event);
    }
    _loadComplete(e) {
        let s = e.currentTarget.parent;
        if (!s) {
            return;
        }
        if (e && e.currentTarget.name) {
            e.currentTarget.removeEventListener(lufylegend.LEvent.COMPLETE, s._loadComplete);
            if (e.currentTarget.name.indexOf(s.llname) >= 0) {
                e.target = 1;
            }
            if (s.lresult[s.llload + e.currentTarget.name]) {
                return;
            }
            s.result[e.currentTarget.name] = e.target;
            s.lresult[s.llload + e.currentTarget.name] = 1;
        }
        s.index++;
        e.loaded = e.total = 1;
        s._loadProgress(e);
        delete e.currentTarget.parent;
        if (s.index >= s.list.length) {
            if (s.reloadtime) {
                clearTimeout(s.reloadtime);
            }
            let event = new lufylegend.LEvent(lufylegend.LEvent.COMPLETE);
            event.currentTarget = s;
            event.target = s.result;
            s.dispatchEvent(event);
            lufylegend.LGlobal.forceRefresh = true;
        }
    }
    url(u) {
        if (!lufylegend.LGlobal.traceDebug) {
            return u;
        }
        return u + (u.indexOf('?') >= 0 ? '&' : '?') + 't=' + (new Date()).getTime();
    }
}
LLoadManage.load = function(l, u, c, e) {
    let loadObj = new LLoadManage();
    if (u) {
        loadObj.addEventListener(lufylegend.LEvent.PROGRESS, function(event) {
            u((event.loaded * 100 / event.total).toFixed(2));
        });
    }
    if (c) {
        loadObj.addEventListener(lufylegend.LEvent.COMPLETE, function(event) {
            c(event.target);
        });
    }
    if (e) {
        loadObj.addEventListener(lufylegend.LEvent.ERROR, e);
    }
    loadObj.load(l);
};
export default LLoadManage;