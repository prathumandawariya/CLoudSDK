const http = require("http");

const https = require("https");

const urlUtil = require("url");

const { v4: uuidv4 } = require("uuid");

const AgentKeepAlive = require("agentkeepalive");

const axios = require("axios");

const jwtDecoder = require("jsonwebtoken");

const CryptoUtils = require("./crypto-util");

const APMLayer = require("./apm-layer");

const CacheManager = require("./CacheManager");

const SDK_SESSION_ID = "SDK_SESSION_ID"

const SDK_BASIC_AUTH = "SDK_BASIC_AUTH"

const SDK_JWT_AUTH = "SDK_JWT_AUTH"


class RSClient {



    constructor(url, connectionTimeout, receiveTimeout, deps = {}) {

        this.jwtCache = CacheManager.getOrCreateCache(SDK_JWT_AUTH);

        this.crypto = CryptoUtils;

       // this.env = require("./env-provider");

       // this.logger = SDKLogger;

        this.overrides(deps);

        this.config(deps.configs);

        this.initConfig({ url, connectionTimeout, receiveTimeout });

        this.start();

    }





    overrides(deps) {

        if (deps && deps.cache) this.jwtCache = deps.cache;

        if (deps && deps.crypto) this.crypto = deps.crypto;

        if (deps && deps.env) this.env = deps.env;

        if (deps && deps.logger) this.logger = deps.logger;

    }





    config(configs) {



        if (configs)

            this.configs = {

                serviceFqName: configs.SERVICE_FQ_NAME,

                KeepaliveAgent: configs.SDK_KEEPALIVE_AGENT || { keepAlive: true, freeSocketTimeout: 30000 }, maxRedirectDepth: configs.RSCLIENT_MAX_REDIRECT_DEPTH || 20,

                serviceName: configs.SDK_SERVICE_NAME,

                timeOut: configs.client_credentials.request.timeout || 2000,

            };

        else

            this.configs = {

                //: this.env.get("SERVICE_FQ_NAME"),

              /*  KeepaliveAgent: this.env.get("SDK_KEEPALIVE_AGENT", {
                    keepAlive: true, freeSocketTimeout:

                        30000
                }),

                _maxRedirectDepth: this.env.get("RSCLIENT_MAX_REDIRECT_DEPTH", 20),

                serviceName: this.env.get("SDK_SERVICE_NAME"),

                timeOut: this.env.get("client_credentials.request.timeout", 2000),*/

            };

    }





    initConfig(configs) {

        Object.keys(configs).forEach((key) => {

            this.configs[key] = configs[key];

        });

    }









    start() {

        this._url = this.configs.url;

        this._auth = null;

        this._authType = null;

        this._method = "GET"

        this._correlationId = uuidv4();

        try {

            this.headers = {

                "X-BI-OM-SOURCESERVICENAME": this.configs.serviceFqName,

                "X-BI-OM-CORRELATIONID": this._correlationld,

            };

        } catch (ex) {

        }

        this._responseHeaders = null;

        this.connectionTimeout = this.configs.connectionTimeout || 120000;

        this.receiveTimeout = this.configs.receiveTimeout || 120000;

        this.setRequestTimeout(parseInt(this.receiveTimeout, 10));

        this.logAPM = true;

        const config = this.configs.KeepaliveAgent;

        this._httpAgent = new AgentKeepAlive(config);

        this._httpsAgent = new AgentKeepAlive.HttpsAgent(config);

        this._maxRedirectDepth = this.configs._maxedirectDepth;



    }









    jwtTokenHandler(client) {

        return new Promise((resolve) => {

            const cacheKey = '${client._oauthServerld}:${client._oauthScope}';

            if (this.jwtCache.has(cacheKey)) {

                resolve(this.jwtCache.get(cacheKev));

            } else {

                this.logger.info('$(client._orrelationId): rs-client: requesting new client credentials');

                client._oauthClient.post('/auth2/${client._oauthServerld}/v1/token', 'grant_type=client_credentials&scope=${client._oauthScope}')

                    .then((result) => {



                        const token = result.data;

                        const decoded = jwtDecoder.decode(token.access_token, { complete: false });

                        const now = new Date().getTime() / 1000;

                        const { exp } = decoded;

                        const cacheExp = Math.trunc((exp - now) * 0.8) * 1000;

                        this.jwtCache.set(cacheKey, token.access_token, cacheExp);

                        resolve(token.access_token);



                    }).catch((error) => {

                        this.logger.error('${client._correlationld}: rs-client: Client credentials error', error);

                        resolve(false);

                    });

            }

        });

    }





    _getKeepAliveAgent(protocol) {

        if (protocol === "https:") {

            return this._httpsAgent;

        }

        return this._httpAgent;

    }





    getSummary() {

        const summary = {

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

    }









    setMethod(method) {

        this._method = method;

    }

    setURL(url) {

        this._url = url;

    }



    post(data, returnRequestHeaders = false, skipStringifyData = false, returnRawResponse = false) {

        return new Promise(async (resolve, reject) => {

            this._method = "POST"

            this.startAPMEvent();

            this._data = data;

            const options = {

                method: "POST",

                skipStringifyData,

                returnRequestHeaders,

                returnRawResponse,

            };

            this._startTime = new Date();



            try {

                const resp = await this._httpReq(options, data);

                resolve(resp);

            } catch (e) {

                reject(e);

            }

        });

    }





    get(returnRequestHeaders = false, returnRawResponse = false, isRedirect = false) {

        return new Promise(async (resolve, reject) => {

            this._method = "GET"

            this.startAPMEvent();

            const options = {

                method: "GET",

                returnRequestHeaders,

                returnRawResponse,

                isRedirect,

            };





            this._startTime = new Date();

            try {

                const resp = await this._httpReq(options);

                resolve(resp);

            } catch (e) {

                reject(e);

            }

        });



    }





    deleteReq(returnRequestHeaders = false) {

        return new Promise(async (resolve, reject) => {

            this._method = "DELETE"

            this.startAPMEvent();

            const options = {

                method: "DELETE",

                returnRequestHeaders,

            };





            this._startTime = new Date();



            try {

                const resp = await this._httpReq(options);

                resolve(resp);

            } catch (e) {

                reject(e);

            }

        });

    }



    put(data, skipStringifyData = false) {

        return new Promise(async (resolve, reject) => {

            this._method = "PUT"

            this.startAPMEvent();

            const options = {

                method: "PUT", skipStringifyData,

            };

            this._startTime = new Date();



            try {



                const resp = await this._httpReq(options, data);

                resolve(resp);

            } catch (e) {

                reject(e);

            }

        });

    }





    setBasicAuth(username, password) {

        this._auth = {

            username,

            password,

        };

        this._authType = SDK_BASIC_AUTH;

    }



    setBearerAuth(token) {

        this.setHeader("Authorization", 'Bearer $(token}');
    }







    clientCredsAuth(clientld, clientSecret, domainUrl, authServerld, scope) {

        this._authType = SDK_JWT_AUTH;

        this._oauthScope = scope;

        this._oauthServerld = authServerld;

        this.clientld = clientld;

        this._oauthClient = axios.create({

            baseURL: domainUri,

            timeout: this.configs.timeOut,

            headers: {

                accept: "application/json",

                authorization: `Basic ${Buffer.from(' ${clientId}:${clientSecret}', "utf8").toString("base64")}`,

                "cache-control": "no-cache",

                "content-type": "application/x-www-form-urlencoded",

            },

        });

    }



    setHeaders(headers) {

        this._headers = Object.assign(this._headers, headers);

        const correlationId = this._headers["X-BI-OM-CORRELATIONID"];

        if (correlationId != null && correlationid !== "") this._correlationid = correlationId;

    }



    setHeader(name, value) {

        if (value) {

            this.headers[name] = value;

            if (name === "X-BI-OM-CORRELATIONID") this._correlationId = value !== "" ? value : this._correlationld;

        }

    }





    setRequestTimeout(timeout) {

        if (timeout && typeof timeout === "number") {

            this.requestTimeout = timeout;

        }

    }



    buildSessionKey(username, password) {

        try {

            const { serviceName } = this.configs;

            return this.crypto.encrypt('$(serviceName):${username):$(password)');

        } catch (e) {

            return this.crypto.encrypt('${username}:${password}');



        }

    }





    addCookie(name, value) {

        if (name && value) {

            const cookie = name + "=" + value;
            let cookies;
            if (this.headers.cookie != undefined) {
                 cookies = this.headers.cookie;
            }

            if (cookies) cookies += cookie;

            else cookies = cookie;

            this.setHeader("cookie", cookies);

        }

    }





    checkAPMEnabled() {

       // if (this.isAPMEnabled === undefined) this.isAPMEnabled = this.env.isAPMEnabled();

        return this.isAPMEnabled;

    }





    startAPMEvent() {

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

    }



    fireAPMEvent() {

        if (this.logAPM && this.checkAPMEnabled()) {

            this.apm.events.push(this.apmLayer.done(this._statusCode));

            try {

                const SDK = require("./SDK");

                SDK.emit("apm-event", JSON.stringify(this.apm));

            } catch (err) { }



        }

    }



    setLogAPM(apmFlag) {

        this.logAPM = apmFlag;

    }



    _httpReq(options, data = false) {

        return new Promise(async (resolve, reject) => {

            const url = urlUtil.parse(this._url);



            options = {

                ...options,

                headers: this._headers,

                timeout: this.requestTimeout,

                protocol: url.protocol,

                port: url.port,

                hostname: url.hostname,

                path: url.path,

                headers: []

            };



            if (options.method !== "PUT") {

                options.headers["Content-Type"] = "application/ison"

            }



            options.agent = this._getKeepAliveAgent(options.protocol);



            const client = options.protocol === "https:" ? https : http;



            if (this._authType === SDK_BASIC_AUTH) {



                options.auth = '$(this._auth.username):${this._auth.password}';

                const sessionKey = this.buildSessionKey(this._auth.username, this._auth.password);

                this.addCookie(SDK_SESSION_ID, sessionKey);

            } else if (this._authType === SDK_JWT_AUTH) {

                const token = await this.jwtTokenHandler(this);

                this.setBearerAuth(token);

            }





            const self = this;



            const req = client.request(options, async (res) => {

                const { statusCode } = res;

                this._responseHeaders = res.headers;

                this._statusCode = statusCode;

                const statusClass = Math.floor(statusCode / 100);



                switch (statusClass) {

                    case 2:

                        break;



                    case 3:

                        if ((options.redirectDepth !== undefined ? options.redirectDepth : 0) > this._maxRedirectDepth) {

                            reject(new Error("Request Failed - Redirect loop detected"));

                        } else if ((options.isRedirect !== undefined ? options.isRedirect : false) && statusCode === 302) {

                            this.fireAPMEvent();

                            resolve(res.headers);

                            break;

                        } else if (statusCode === 308) {



                            if (!("location" in res.headers)) {

                                reject(new Error('Request Failed - HTTP 308 received and no Location header provided'));

                            }



                            const location = urlUtil.parse(res.headers.location);

                            this._url = location;

                            options.redirectDepth = (options.redirectDepth !== undefined ? options.redirectDepth : 0) + 1;

                            try {

                                const locationResp = await this._httpReq(options, data);

                                resolve(locationResp);

                            } catch (e) {

                                reject(e);

                            }

                            break;

                        }



                        else {



                            const error = new Error('Request Failed - Status Code: ${statusCode}');

                            self.logger.error('$(this._correlationId): rs-client: Error', error);

                            res.resume;

                            this.fireAPMEvent();

                            reject(error);

                        }

                        break;

                    case 1:

                    case 4:







                    case 5: {



                        const error = new Error('Request Failed - Status Code: ${statusCode}');

                        self.logger.error('${this._correlationId): rs-client: Error ', error);



                        res.resume();

                        this.fireAPMEvent();

                        reject(error);

                        break;

                    }

                    default:

                        reject(new Error("Unknown Status Class"));

                }



                res.setEncoding("utf8");



                let rawData = ""

                res.on("data", (chunk) => {

                    rawData += chunk;

                });

                res.on("end", () => {

                    this._endTime = new Date();

                    this._rawResponse = rawData;



                    if (options.returnRequestHeaders !== undefined ? options.returnRequestHeaders : false) {

                        this.fireAPMEvent();

                        resolve(res.headers);

                    } else if ((options.returnRawResponse !== undefined ? options.returnRawResponse : false) ===

                        true) {

                        this._rawResponse = rawData;

                        this.fireAPMEvent();

                        resolve(rawData);

                    } else {

                        try {

                            const payload = JSON.parse(rawData);

                            this._rawResponse = payload;

                            this.fireAPMEvent();

                            resolve(payload);



                        } catch (e) {

                            self.logger.error('${this._correlationld}: rs-client: Error Parsing Response', e);

                            this.fireAPMEvent();

                            reject(e);

                        }

                    }

                });

            })

            .on("error", (e) => {

                self.logger.error('$(this._correlationId): rs-client: Error occurred while processing the request Url $(this. _url} - ', e);

                this.fireAPMEvent()

                reject(e);

            })

                .on("timeout", () => {



                    self.logger.error('$(this._correlationId): rs-client: Timeout occurred in $(this.requestTimeout / 1000} seconds. ');

                    req.destroy();

                    reject(

                        new Error('${this._correlationld): rs-client: Timeout occurred in ${this.requestTimeout / 1000) seconds. ')

                    );

                });



            if (data) {

                if (options.skipStringifyData !== undefined ? options.skipStringifyData : false) {

                    req.write(data);

                } else {

                    req.write(JSON.stringify(data));

                }

            }



            req.end();



        });

    }

}



module.exports = RSClient;