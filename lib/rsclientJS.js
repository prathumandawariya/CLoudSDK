var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var http = require("http");
var https = require("https");
var urlUtil = require("url");
var uuidv4 = require("uuid").v4;
var AgentKeepAlive = require("agentkeepalive");
var axios = require("axios");
var jwtDecoder = require("jsonwebtoken");
var CryptoUtils = require("./crypto-util");
var APMLayer = require("./apm-layer");
var CacheManager = require("./CacheManager");
var SDK_SESSION_ID = "SDK_SESSION_ID";
var SDK_BASIC_AUTH = "SDK_BASIC_AUTH";
var SDK_JWT_AUTH = "SDK_JWT_AUTH";
var RSClient = /** @class */ (function () {
    function load(url, connectionTimeout, receiveTimeout, deps) {
        if (deps === void 0) { deps = {}; }
        this.jwtCache = CacheManager.getOrCreateCache(SDK_JWT_AUTH);
        this.crypto = CryptoUtils;
        this.env = require("./env-provider");
        this.logger = SDKLogger;
        this.overrides(deps);
        this.config(deps.configs);
        this.initConfig({ url: url, connectionTimeout: connectionTimeout, receiveTimeout: receiveTimeout });
        this.start();
    }
    function overrides(deps) {
        if (deps && deps.cache)
            this.jwtCache = deps.cache;
        if (deps && deps.crypto)
            this.crypto = deps.crypto;
        if (deps && deps.env)
            this.env = deps.env;
        if (deps && deps.logger)
            this.logger = deps.logger;
    };
    function config(configs) {
        if (configs)
            this.configs = {
                serviceFqName: configs.SERVICE_FQ_NAME,
                KeepaliveAgent: configs.SDK_KEEPALIVE_AGENT || { keepAlive: true, freeSocketTimeout: 30000 }, maxRedirectDepth: configs.RSCLIENT_MAX_REDIRECT_DEPTH || 20,
                serviceName: configs.SDK_SERVICE_NAME,
                timeOut: configs.client_credentials.request.timeout || 2000,
            };
        else
            this.configs = {
                serviceFqName: this.env.get("SERVICE_FQ_NAME"),
                KeepaliveAgent: this.env.get("SDK_KEEPALIVE_AGENT", {
                    keepAlive: true, freeSocketTimeout: 30000
                }),
                _maxRedirectDepth: this.env.get("RSCLIENT_MAX_REDIRECT_DEPTH", 20),
                serviceName: this.env.get("SDK_SERVICE_NAME"),
                timeOut: this.env.get("client_credentials.request.timeout", 2000),
            };
    };
    function initConfig(configs) {
        var _this = this;
        Object.keys(configs).forEach(function (key) {
            _this.configs[key] = configs[key];
        });
    };
    function start() {
        this._url = this.configs.url;
        this._auth = null;
        this._authType = null;
        this._method = "GET";
        this._correlationId = uuidv4();
        try {
            this.headers = {
                "X-BI-OM-SOURCESERVICENAME": this.configs.serviceFqName,
                "X-BI-OM-CORRELATIONID": this._correlationld,
            };
        }
        catch (ex) {
        }
        this._responseHeaders = null;
        this.connectionTimeout = this.configs.connectionTimeout || 120000;
        this.receiveTimeout = this.configs.receiveTimeout || 120000;
        this.setRequestTimeout(parselnt(this.receiveTimeout, 10));
        this.logAPM = true;
        var config = this.configs.KeepaliveAgent;
        this._httpAgent = new AgentKeepAlive(config);
        this._httpsAgent = new AgentKeepAlive.HttpsAgent(config);
        this._maxRedirectDepth = this.configs._maxedirectDepth;
    };
    function jwtTokenHandler(client) {
        var _this = this;
        return new Promise(function (resolve) {
            var cacheKey = '${client._oauthServerld}:${client._oauthScope}';
            if (_this.jwtCache.has(cacheKey)) {
                resolve(_this.jwtCache.get(cacheKev));
            }
            else {
                _this.logger.info('$(client._orrelationId): rs-client: requesting new client credentials');
                client._oauthClient.post('/auth2/${client._oauthServerld}/v1/token', 'grant_type=client_credentials&scope=${client._oauthScope}')
                    .then(function (result) {
                    var token = result.data;
                    var decoded = jwtDecoder.decode(token.access_token, { complete: false });
                    var now = new Date().getTime() / 1000;
                    var exp = decoded.exp;
                    var cacheExp = Math.trunc((exp - now) * 0.8) * 1000;
                    _this.jwtCache.set(cacheKey, token.access_token, cacheExp);
                    resolve(token.access_token);
                }).catch(function (error) {
                    _this.logger.error('${client._correlationld}: rs-client: Client credentials error', error);
                    resolve(false);
                });
            }
        });
    };
    function _getKeepAliveAgent(protocol) {
        if (protocol === "https:") {
            return this._httpsAgent;
        }
        return this._httpAgent;
    };
    function getSummary() {
        var summary = {
            request: {
                headers: this._headers,
                url: this._url,
                method: this._method,
            },
            response: {
                headers: this._responseHeaders,
                statusCode: this._statusCode,
                body: this._rawResponse,
            },
            startTime: this._startTime,
        };
        if (this._endTime && this._endTime !== undefined) {
            summary.lapsedTime = this._endTime - this._startTime;
        }
        if (this._data && this._data !== undefined) {
            summary.request.body = this._data;
        }
        return summary;
    };
    function setMethod(method) {
        this._method = method;
    };
    function setURL(url) {
        this._url = url;
    };
    function post(data, returnRequestHeaders, skipStringifyData, returnRawResponse) {
        var _this = this;
        if (returnRequestHeaders === void 0) { returnRequestHeaders = false; }
        if (skipStringifyData === void 0) { skipStringifyData = false; }
        if (returnRawResponse === void 0) { returnRawResponse = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, resp, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._method = "POST";
                        this.startAPMEvent();
                        this._data = data;
                        options = {
                            method: "POST",
                            skipStringifyData: skipStringifyData,
                            returnRequestHeaders: returnRequestHeaders,
                            returnRawResponse: returnRawResponse,
                        };
                        this._startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._httpReq(options, data)];
                    case 2:
                        resp = _a.sent();
                        resolve(resp);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        reject(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    function get(returnRequestHeaders, returnRawResponse, isRedirect) {
        var _this = this;
        if (returnRequestHeaders === void 0) { returnRequestHeaders = false; }
        if (returnRawResponse === void 0) { returnRawResponse = false; }
        if (isRedirect === void 0) { isRedirect = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, resp, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._method = "GET";
                        this.startAPMEvent();
                        options = {
                            method: "GET",
                            returnRequestHeaders: returnRequestHeaders,
                            returnRawResponse: returnRawResponse,
                            isRedirect: isRedirect,
                        };
                        this._startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._httpReq(options)];
                    case 2:
                        resp = _a.sent();
                        resolve(resp);
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        reject(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    function deleteReq(returnRequestHeaders) {
        var _this = this;
        if (returnRequestHeaders === void 0) { returnRequestHeaders = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, resp, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._method = "DELETE";
                        this.startAPMEvent();
                        options = {
                            method: "DELETE",
                            returnRequestHeaders: returnRequestHeaders,
                        };
                        this._startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._httpReq(options)];
                    case 2:
                        resp = _a.sent();
                        resolve(resp);
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        reject(e_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    function put(data, skipStringifyData) {
        var _this = this;
        if (skipStringifyData === void 0) { skipStringifyData = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, resp, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._method = "PUT";
                        this.startAPMEvent();
                        options = {
                            method: "PUT",
                            skipStringifyData: skipStringifyData,
                        };
                        this._startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._httpReq(options, data)];
                    case 2:
                        resp = _a.sent();
                        resolve(resp);
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        reject(e_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    function setBasicAuth(username, password) {
        this._auth = {
            username: username,
            password: password,
        };
        this._authType = SDK_BASIC_AUTH;
    };
    function setBearerAuth(token) {
        this.setHeader("Authorization", 'Bearer $(token}');
    };
    function clientCredsAuth(clientld, clientSecret, domainUrl, authServerld, scope) {
        this._authType = SDK_JWT_AUTH;
        this._oauthScope = scope;
        this._oauthServerld = authServerld;
        this.clientld = clientld;
        this._oauthClient = axios.create({
            baseURL: domainUri,
            timeout: this.configs.timeOut,
            headers: {
                accept: "application/json",
                authorization: "Basic ".concat(Buffer.from(' ${clientId}:${clientSecret}', "utf8").toString("base64")),
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
            },
        });
    };
    function setHeaders(headers) {
        this._headers = Object.assign(this._headers, headers);
        var correlationId = this._headers["X-BI-OM-CORRELATIONID"];
        if (correlationId != null && correlationid !== "")
            this._correlationid = correlationId;
    };
    function setHeader(name, value) {
        if (value) {
            this._headers[name] = value;
            if (name === "X-BI-OM-CORRELATIONID")
                this._correlationId = value !== "" ? value : this._correlationld;
        }
    };
    function setRequestTimeout(timeout) {
        if (timeout && typeof timeout === "number") {
            this.requestTimeout = timeout;
        }
    };
    function buildSessionKey(username, password) {
        try {
            var serviceName = this.configs.serviceName;
            return this.crypto.encrypt('$(serviceName):${username):$(password)');
        }
        catch (e) {
            return this.crypto.encrypt('${username}:${password}');
        }
    };
    function addCookie(name, value) {
        if (name && value) {
            var cookie = '$(name)=$(value);';
            var cookies = this._headers.cookie;
            if (cookies)
                cookies += cookie;
            else
                cookies = cookie;
            this.setHeader("cookie", cookies);
        }
    };
    function checkAPMEnabled() {
        if (this.isAPMEnabled === undefined)
            this.isAPMEnabled = this.env.isAPMEnabled();
        return this.isAPMEnabled;
    };
    function startAPMEvent() {
        if (this.logAPM && this.checkAPMEnabled()) {
            this.apm = {
                componentCategoryCode: "JAX_RS_CLIENT",
                componentTypeCode: "JAVASCRIPT", componentName: "RSClient",
                operationParameters: LI,
                statusCode: 200,
                startTime: this._startTime,
                events: [],
                source_service_name: this.configs.serviceFqName,
                component_correlation_id: this._correlationId,
                short_name: (this._auth && this._auth.username) || this.clientld,
            };
            this.apmLayer = APMLayer("JAX_RS_CLIENT", "RSClient", this._method, [this._url]);
        }
    };
    function fireAPMEvent() {
        if (this.logAPM && this.checkAPMEnabled()) {
            this.apm.events.push(this.apmLayer.done(this._statusCode));
            try {
                var SDK = require("./SDK");
                SDK.emit("apm-event", JSON.stringify(this.apm));
            }
            catch (err) { }
        }
    };
    function setLogAPM(apmFlag) {
        this.logAPM = apmFlag;
    };
    function _httpReq(options, data) {
        var _this = this;
        if (data === void 0) { data = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var url, client, sessionKey, token, self, req;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = urlUtil.parse(this._url);
                        options = __assign(__assign({}, options), { headers: this._headers, timeout: this.requestTimeout, protocol: url.protocol, port: url.port, hostname: url.hostname, path: url.path });
                        if (options.method !== "PUT" && !options.headers["Content-Type"]) {
                            options.headers["Content-Type"] = "application/ison";
                        }
                        options.agent = this._getKeepAliveAgent(options.protocol);
                        client = options.protocol === "https:" ? https : http;
                        if (!(this._authType === SDK_BASIC_AUTH)) return [3 /*break*/, 1];
                        options.auth = '$(this._auth.username):${this._auth.password}';
                        sessionKey = this.buildSessionKey(this._auth.username, this.auth.password);
                        this.addCookie(SDK_SESSION_ID, sessionKey);
                        return [3 /*break*/, 3];
                    case 1:
                        if (!(this._authType === SDK_JWT_AUTH)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.jwtTokenHandler(this)];
                    case 2:
                        token = _a.sent();
                        this.setBearerAuth(token);
                        _a.label = 3;
                    case 3:
                        self = this;
                        req = client.request(options, function (res) { return __awaiter(_this, void 0, void 0, function () {
                            var statusCode, statusClass, _a, location, locationResp, e_5, error, error, rawData;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        statusCode = res.statusCode;
                                        this._responseHeaders = res.headers;
                                        this._statusCode = statusCode;
                                        statusClass = Math.floor(statusCode / 100);
                                        _a = statusClass;
                                        switch (_a) {
                                            case 2: return [3 /*break*/, 1];
                                            case 3: return [3 /*break*/, 2];
                                            case 1: return [3 /*break*/, 11];
                                            case 4: return [3 /*break*/, 11];
                                            case 5: return [3 /*break*/, 11];
                                        }
                                        return [3 /*break*/, 12];
                                    case 1: return [3 /*break*/, 13];
                                    case 2:
                                        if (!((options.redirectDepth !== undefined ? options.redirectDepth : 0) > this._maxRedirectDepth)) return [3 /*break*/, 3];
                                        reject(new Error("Request Failed - Redirect loop detected"));
                                        return [3 /*break*/, 10];
                                    case 3:
                                        if (!((options.isRedirect !== undefined ? options.isRedirect : false) && statusCode === 302)) return [3 /*break*/, 4];
                                        this.fireAPMEvent();
                                        resolve(res.headers);
                                        return [3 /*break*/, 13];
                                    case 4:
                                        if (!(statusCode === 308)) return [3 /*break*/, 9];
                                        if (!("location" in res.headers)) {
                                            reject(new Error('Request Failed - HTTP 308 received and no Location header provided'));
                                        }
                                        location = urlUtil.parse(res.headers.location);
                                        this._url = location;
                                        options.redirectDepth = (options.redirectDepth !== undefined ? options.redirectDepth : 0) + 1;
                                        _b.label = 5;
                                    case 5:
                                        _b.trys.push([5, 7, , 8]);
                                        return [4 /*yield*/, this._httpReq(options, data)];
                                    case 6:
                                        locationResp = _b.sent();
                                        resolve(locationResp);
                                        return [3 /*break*/, 8];
                                    case 7:
                                        e_5 = _b.sent();
                                        reject(e_5);
                                        return [3 /*break*/, 8];
                                    case 8: return [3 /*break*/, 13];
                                    case 9:
                                        error = new Error('Request Failed - Status Code: ${statusCode}');
                                        self.logger.error('$(this._correlationId): rs-client: Error', error);
                                        res.resume;
                                        this.fireAPMEvent();
                                        reject(error);
                                        _b.label = 10;
                                    case 10: return [3 /*break*/, 13];
                                    case 11:
                                        {
                                            error = new Error('Request Failed - Status Code: ${statusCode}');
                                            self.logger.error('${this._correlationId): rs-client: Error ', error);
                                            res.resume();
                                            this.fireAPMEvent();
                                            reject(error);
                                            return [3 /*break*/, 13];
                                        }
                                        _b.label = 12;
                                    case 12:
                                        reject(new Error("Unknown Status Class"));
                                        _b.label = 13;
                                    case 13:
                                        res.setEncoding("utf8");
                                        rawData = "'";
                                        res.on("data", function (chunk) {
                                            rawData += chunk;
                                        });
                                        res.on("end", function () {
                                            _this._endTime = new Date();
                                            _this._rawResponse = rawData;
                                            if (options.returnRequestHeaders !== undefined ? options.returnRequestHeaders : false) {
                                                _this.fireAPMEvent();
                                                resolve(res.headers);
                                            }
                                            else if ((options.returnRawResponse !== undefined ? options.returnRawResponse : false) ===
                                                true) {
                                                _this._rawResponse = rawData;
                                                _this.fireAPMEvent();
                                                resolve(rawData);
                                            }
                                            else {
                                                try {
                                                    var payload = JSON.parse(rawData);
                                                    _this._rawResponse = payload;
                                                    _this.fireAPMEvent();
                                                    resolve(payload);
                                                }
                                                catch (e) {
                                                    self.logger.error('${this._correlationld}: rs-client: Error Parsing Response', e);
                                                    _this.fireAPMEvent();
                                                    reject(e);
                                                }
                                            }
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        on("error", function (e) {
                            self.logger.error('$(this._correlationId): rs-client: Error occurred while processing the request Url $(this. _url} - ', e);
                            _this.fireAPMEvent();
                            reject(e);
                        })
                            .on("timeout", function () {
                            self.logger.error('$(this._correlationId): rs-client: Timeout occurred in $(this.requestTimeout / 1000} seconds. ');
                            req.destroy();
                            reject(new Error('${this._correlationld): rs-client: Timeout occurred in ${this.requestTimeout / 1000) seconds. '));
                        });
                        if (data) {
                            if (options.skipStringifyData !== undefined ? options.skipStringifyData : false) {
                                req.write(data);
                            }
                            else {
                                reg.write(JSON.stringify(data));
                            }
                        }
                        req.send();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return RSClient;
}());
module.export = RSClient;
