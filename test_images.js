const urls = [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1729717949948-56b52db111dd?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1729717949712-1c51422693d1?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1670337476682-522bd45a188d?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1677129667171-92abd8740fa3?q=80&w=800&h=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&h=600&auto=format&fit=crop'
];
const https = require('https');
(async () => {
    for (let url of urls) {
        await new Promise(resolve => {
            https.get(url, (res) => {
                console.log(res.statusCode + ' : ' + url);
                resolve();
            });
        });
    }
})();
