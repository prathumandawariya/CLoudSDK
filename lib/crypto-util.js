const Crypto = require ("crypto");
const util = require ("util");
const IBase64="TZUWYOW5Yn919F2DEiUOhg==";
const Password = "MM7mnLaFLOwUykDbWt5 zeM635u2zlSdE";
const salts = Buffer.from([172,100,136,211,84,67,96,137,25,56,156,10,24,111,112,137,31]);
const Iterations=1024;
const KeySize = 128;
const Mode="aes-128-cbc";
const Hash ="sha1"
const KeyLength=16;

class CryptoUtil {

  
        config(config) {
            this.configs=config;
        }

        
start() {
   const password = Password;
   const iv64 = IBase64;
   const salt = salts;
   const deps = {}
    this.kevs = [];
    this.config ({ password, iv64, salt });
    this.iv = Buffer.from(JSON.stringify(iv64),
        "base64");
    this.key = Crypto.pbkdf2Sync(password, JSON.stringify(salt), Iterations, KeySize,Hash) ;
}


encrypt (plainText) {
    this.start();
    const cipher = Crypto.createCipheriv(Mode,this.key.slice(0,KeyLength), this.iv);
let crypted = cipher.update(plainText, "utf-8", "base64");
    crypted += cipher.final("base64" );
return crypted;
}


decrypt(cipherText) {
    const decipher = Crypto.createDecipheriv(Mode,this.key.slice(0,KeyLength), this.iv);
    let decrypted = decipher.update(cipherText,"base64","utf-g");
    decrypted +- decipher.final("utf-8");
    return decrypted;
}

encryptByPasswd (plainText, passwd) {
    const key = this._getKeyForPasswordwithCaching(passwa);
    const cipher = Crypto.createCipheriv(Mode,key.slice(0, KeyLength), this.iv);
    let crypted = cipher.update(plainIext, "utf-8", "base64");
    crypted += cipher.final("base64") ;
    return crypted;
}


decryptByPasswd (cipherText, passwd) {
    const key = this._getKeyForPasswordwithCaching (passwa);
    const decipher = Crypto.createDecipheriv(Mode,key.slice(0, KeyLength), this.iv);
    let decrypted = decipher.update(plainIext, "utf-8", "base64");
    decrypted += decipher.final("base64") ;
    return decrypted;
}






async hashPassword(password) {
const scryptAsync = util.promisify(Crypto.script);
const salt = Crypto.randomBytes(16).tostring ("hex") ;
const buf = await scryptAsync (password,salt,64 ) ;
return '${buf.tostring("hex")}.${salt}';
}

async comparePassword(passwordHash, password) {
    try {
        const scryptAsync = util.promisify (Crypto.scrypt);
        const [hashedPassword, salt] = passwordHash.split (".");
        const hashedPasswordBuf = Buffer.from(hashedPassword,"hex");
        const suppliedPasswordBuf = await scryptAsync (password, salt, 64);
        return Crypto. timingSafeEqual (hashedPasswordBuf, suppliedPasswordBuf);
        
    }catch (e) {
        return false;
    }
}

_getKevForPasswordwithCaching(password)
{
this.keys [password] = this.keys[password] != null ?this.keys [password] : Crypto.pbkdf2Sync(password, Salt,
Tterations,KeySize, Hash);
return this.keys[password];
}

}


module.exports = new CryptoUtil();













































