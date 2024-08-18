const games = {
    1: {
        name: 'Riding Extreme 3D',
        appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
        promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
        eventDelay: 22000,
        attemptCount: 22
    },
    2: {
        name: 'Chain Cube 2048',
        appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
        eventDelay: 20000,
        attemptCount: 10
    },
    3: {
        name: 'My Clone Army',
        appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
        promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767',
        eventDelay: 70000,
        attemptCount: 11
    },
    4: {
        name: 'Train Miner',
        appToken: '82647f43-3f87-402d-88dd-09a90025313f',
        promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
        eventDelay: 20000,
        attemptCount: 10
    },
    5: {
        name: 'Merge Away',
        appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
        promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
        eventDelay: 20000,
        attemptCount: 10
    },
    6: {
        name: 'Twerk Race',
        appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        eventDelay: 20000,
        attemptCount: 10
    }
};

let currentGameNumber = 3; // Default game
let currentLanguage = 'TR'; // Default language

const translations = {
    TR: {
        header: 'Hamster Anahtar Üretici',
        startBtn: 'Anahtarları Al',
        copyAllBtn: 'Tüm Anahtarları Kopyala',
        warningMessage: '%100 olsa bile biraz beklemeniz gerekir. yaklaşık 10 dakika bekleme süresi var. sebebi ise oyunların delay süresi arttırıldı.',
        copyBtn: 'Kopyala',
        channel: 'Kanal',
        admin: 'Yönetici'
    },
    EN: {
        header: 'Hamster Key Generator',
        startBtn: 'Get Keys',
        copyAllBtn: 'Copy All Keys',
        warningMessage: 'Even if it reaches 100%, you will need to wait. There is a delay of about 10 minutes due to the increased delay of the games.',
        copyBtn: 'Copy',
        channel: 'Channel',
        admin: 'Admin'
    }
};

const setLanguage = (lang) => {
    currentLanguage = lang;
    document.querySelector('.header').textContent = translations[lang].header;
    document.getElementById('startBtn').textContent = translations[lang].startBtn;
    document.getElementById('copyAllBtn').textContent = translations[lang].copyAllBtn;
    document.getElementById('warningMessage').textContent = translations[lang].warningMessage;
    document.querySelectorAll('.footer-button')[0].textContent = translations[lang].channel;
    document.querySelectorAll('.footer-button')[1].textContent = translations[lang].admin;
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".game-button").forEach(button => {
        button.addEventListener("click", (e) => {
            document.querySelectorAll(".game-button").forEach(btn => btn.classList.remove("selected"));
            e.target.classList.add("selected");
            currentGameNumber = parseInt(e.target.getAttribute('data-game'));
        });
    });

    document.getElementById('startBtn').addEventListener('click', async () => {
        const startBtn = document.getElementById('startBtn');
        const keyContainer = document.getElementById('keyContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const keysList = document.getElementById('keysList');
        const copyAllBtn = document.getElementById('copyAllBtn');
        const warningMessage = document.getElementById('warningMessage');

        startBtn.disabled = true;
        keyContainer.classList.remove('hidden');
        progressBar.parentElement.classList.remove('hidden');
        keysList.innerHTML = '';
        copyAllBtn.classList.add('hidden');

        warningMessage.classList.remove('hidden');

        const generateClientId = () => {
            const timestamp = Date.now();
            const randomNumbers = [];
            for (let i = 0; i < 19; i++) {
                randomNumbers.push(Math.floor(Math.random() * 10));
            }
            return `${timestamp}-${randomNumbers.join('')}`;
        };

        const loginClient = async (gameNumber) => {
            const clientId = generateClientId();
            const url = 'https://api.gamepromo.io/promo/login-client';
            const data = {
                appToken: games[gameNumber].appToken,
                clientId: clientId,
                clientOrigin: 'deviceid'
            };
            const headers = {
                'Content-Type': 'application/json; charset=utf-8',
            };
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.error_code === 'TooManyIpRequest') {
                    console.log('Too many requests');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    return loginClient(gameNumber);
                }
                return result.clientToken;
            } catch (error) {
                return loginClient(gameNumber);
            }
        };

        const registerEvent = async (token, gameNumber) => {
            const { eventDelay, attemptCount } = games[gameNumber];
            let attempts = 0;
            const register = async () => {
                await new Promise(resolve => setTimeout(resolve, eventDelay));
                const eventId = generateRandomUUID();
                const url = 'https://api.gamepromo.io/promo/register-event';
                const data = {
                    promoId: games[gameNumber].promoId,
                    eventId: eventId,
                    eventOrigin: 'undefined'
                };
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                };
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    if (result.hasCode) {
                        return token;
                    } else if (++attempts < attemptCount) {
                        console.log('Retry register event');
                        return register();
                    } else {
                        throw new Error('Failed to register event after multiple attempts.');
                    }
                } catch (error) {
                    console.error('Error:', error.message);
                    if (++attempts < attemptCount) {
                        return register();
                    } else {
                        throw new Error('Failed to register event after multiple attempts.');
                    }
                }
            };
            return register();
        };

        const createCode = async (token, gameNumber) => {
            const { attemptCount } = games[gameNumber];
            let attempts = 0;
            let response;
            const create = async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const url = 'https://api.gamepromo.io/promo/create-code';
                const data = {
                    promoId: games[gameNumber].promoId
                };
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                };
                try {
                    response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    if (result.promoCode) {
                        return result.promoCode;
                    } else if (++attempts < attemptCount) {
                        console.log('Retry create code');
                        return create();
                    } else {
                        throw new Error('Failed to create code after multiple attempts.');
                    }
                } catch (error) {
                    console.error('Error:', error.message);
                    if (++attempts < attemptCount) {
                        return create();
                    } else {
                        throw new Error('Failed to create code after multiple attempts.');
                    }
                }
            };
            return create();
        };

        const generateRandomUUID = () => {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
            );
        };

        const endGenerateTime = Date.now() + 4 * 40 * 1000;
        const updateProgress = () => {
            const now = new Date();
            const distance = endGenerateTime - now.getTime();
            const progress = Math.max(0, (1 - distance / (4 * 40 * 1000)) * 100).toFixed(2);
            progressBar.style.width = progress + '%';
            progressText.innerText = `${progress}%`;

            if (distance < 0) {
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressText.innerText = '100%';
                startBtn.disabled = false;
            }
        };
        const progressInterval = setInterval(updateProgress, 1000);

        const tasks = [];
        for (let i = 0; i < 4; i++) {
            tasks.push((async (index) => {
                try {
                    let token = await loginClient(currentGameNumber);
                    let registerToken = await registerEvent(token, currentGameNumber);
                    const promoCode = await createCode(registerToken, currentGameNumber);
                    const keyDiv = document.createElement('div');
                    keyDiv.classList.add('key-item');
                    keyDiv.innerHTML = `
                        <input type="text" value="${promoCode}" readonly />
                        <button class="copyKeyBtn" data-clipboard-text="${promoCode}">${translations[currentLanguage].copyBtn}</button>
                    `;
                    keysList.appendChild(keyDiv);
                } catch (error) {
                    console.error('Error:', error.message);
                }
            })(i));
        }
        await Promise.all(tasks);

        copyAllBtn.classList.remove('hidden');
        startBtn.disabled = false;
        progressBar.parentElement.classList.add('hidden');

        document.querySelectorAll('.copyKeyBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                input.select();
                document.execCommand('copy');
            });
        });

        copyAllBtn.addEventListener('click', () => {
            const allKeys = [...document.querySelectorAll('.key-item input')].map(input => input.value).join('\n');
            navigator.clipboard.writeText(allKeys);
        });
    });

    document.getElementById('langTR').addEventListener('click', () => setLanguage('TR'));
    document.getElementById('langEN').addEventListener('click', () => setLanguage('EN'));

    // Set default language to Turkish
    setLanguage('TR');
});
