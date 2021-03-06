
var WxLocalRequest = (function () {
	function WxLocalRequest () {
        this.responseType = 'text';
	}
	var p = {
		setRequestHeader:function(type, application){
        },
		_onreadystatechange:function(e){
            if (!this.onreadystatechange) {
                return;
            }
            var event = {
                currentTarget: {
                    readyState: 4,
                    status: 200,
                    responseType: this.responseType,
                    _responseType: this._responseType,
                    responseText: e.data,
                    response: e.data
                }
            };
            this.onreadystatechange(event);
        },
		_onerror:function(event){
            if (!this.onerror) {
                return;
            }
            this.onerror(event);
        },
		open:function(method, url, async, user, password){
            this.url = url;
        },
		send:function(body){
            var s = this;
            var option = {
                filePath: this.url, 
                success: function(event) {
                    s._onreadystatechange(event);
                }, 
                fail: function(event) {
                    s._onerror(event);
                }
            };
            if (this.responseType === 'text') {
                option.encoding = 'utf8';
            }
            wx.getFileSystemManager().readFile(option);
        }
	};
	for (var k in p) {
		WxLocalRequest.prototype[k] = p[k];
	}
	return WxLocalRequest;
})();