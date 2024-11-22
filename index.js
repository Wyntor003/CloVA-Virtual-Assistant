const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
    window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = "th-TH";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const CLIENT_ID = "144e579487e44f58bc22f118d10e66ee";
const REDIRECT_URI = "http://127.0.0.1:5500/";
const SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming";
const params = new URLSearchParams(window.location.hash.substr(1));
var accessToken = params.get("access_token");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

fetch("responses.json").then((response) => response.json()).then((json) =>
    (document.querySelector(".temp2").innerHTML = JSON.stringify(json))
);

function call_clova() {
    if (document.querySelector(".container").style.opacity == "1") {
        var responses = JSON.parse(document.querySelector(".temp2").innerHTML);
        console.log(responses["after calls"][Math.floor(Math.random() * responses["after calls"].length)]);
        // speak(responses["after_calls"][Math.floor(Math.random() * responses["after_call"].length)]);
        // document.querySelector(".voice_audio").play();
        // document.querySelector(".voice_audio").onended = () => {
        recognition.start();
        // };
    }
}

function system_shutdown() {
    recognition.stop();
    var audio = new Audio("Sounds/shutdown sound.mp3");
    audio.play();
    document.querySelector(".container").style.opacity = ".5";
    document.querySelector(".container").style.scale = ".9";
    document.querySelector(".container").style.boxShadow = "0 0 0 0 #7bacd4";
    document.querySelector(".text_group").style.opacity = ".5";
    document.querySelector(".text_group").style.scale = ".9";
    sleep(1000).then(() => {
        document.querySelector(".container").style.animationPlayState = "paused";
        document.querySelector(".power_btn").setAttribute("onclick", "system_boostup()");
    });
}

function system_boostup() {
    var audio = new Audio("Sounds/boostup sound.mp3");
    audio.play();
    document.querySelector(".container").style.animationPlayState = "running";
    document.querySelector(".container").style.opacity = "1";
    document.querySelector(".container").style.scale = "1";
    document.querySelector(".container").style.boxShadow = "0 0 5dvw .5dvw #7bacd4";
    document.querySelector(".text_group").style.opacity = "1";
    document.querySelector(".text_group").style.scale = "1";
    sleep(1000).then(() => {
        var responses = JSON.parse(document.querySelector(".temp2").innerHTML);
        console.log(responses["greetings"][Math.floor(Math.random() * responses["greetings"].length)]);
        // speak(responses["greetings"][Math.floor(Math.random() * responses["greetings"].length)]);
        // document.querySelector(".voice_audio").play();
        //     document.querySelector(".voice_audio").onended = () => {
        recognition.start();
        document.querySelector(".power_btn").setAttribute("onclick", "system_shutdown()");
        // };
    });
}

function system_restart() {
    recognition.stop();
    system_shutdown();
    sleep(5000).then(() => {
        system_boostup();
    });
}

function spotify(action) {
    fetch("https://api.spotify.com/v1/me/player/" + action[0], {
        method: action[1],
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

function spotify_song() {
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response) => response.json()).then((json) => {
        sessionStorage.setItem("current song", json["item"]["name"]);
        sessionStorage.setItem(
            "current artist",
            json["item"]["artists"][0]["name"]
        );
    });
}

var func_dict = {
    system: ["shut", "turn", "down", "off", "restart"],
    computer: ["shut", "turn", "down", "off"],
    note: ["write", "create", "save"],
    music: ["continue", "play", "playing", "turn", "on", "stop", "off", "pause", "resume",],
    song: ["next", "previous", "what"],
};

function analyze_func(text, responses) {
    console.log(text);
    text = text.split(" ");
    let match = [];
    const func_name = Object.keys(func_dict);

    for (let i = 0; i < func_name.length; i++) {
        if (text.includes(func_name[i])) {
            for (let j = 0; j < text.length; j++) {
                for (let k = 0; k < func_dict[func_name[i]].length; k++) {
                    if (text[j] == func_dict[func_name[i]][k]) {
                        match.push(func_dict[func_name[i]][k]);
                    }
                }
            }
            match.push(func_name[i]);
            break;
        }
    }

    if (match.includes("music")) {
        if (match.includes("continue") && match.includes("playing")) {
            match = ["resume", "music"];
        } else if (match.includes("play")) {
            match = ["turn", "on", "music"];
        }
    } else if (match.includes("system")) {
        if (match.includes("turn") && match.includes("off")) {
            match = ["shut", "down", "system"];
        }
    } else if (match.includes("computer")) {
        if (match.includes("turn") && match.includes("off")) {
            match = ["shut", "down", "computer"];
        }
    } else if (match.includes("note")) {
        if (match.includes("write")) {
            match = ["create", "note"];
        }
    }

    match = match.join(" ");

    if (Object.keys(responses).includes(match)) {
        return match;
    } else {
        return "not recognized";
    }

    //   if (containsAny([match[match.length -1]], func_name)) {
    //     localStorage.setItem("last_command", match[match.length-1])
    //   }
}

function do_that_func(func_name) {
    if (func_name == "shut down system") {
        system_shutdown();
    } else if (func_name == "restart system") {
        system_restart();
    } else if (func_name == "shut down computer") {
        computer_shutdown();
    } else if (func_name == "create note") {
        create_note();
    } else if (func_name == "save note") {
        save_note();
    } else if (func_name == "turn on music" || func_name == "resume music") {
        spotify(["play", "PUT"]);
    } else if (func_name == "stop music") {
        spotify(["pause", "PUT"]);
    } else if (func_name == "next song") {
        spotify(["next", "POST"]);
    } else if (func_name == "previous song") {
        spotify(["previous", "POST"]);
    }
}

// Recognize speech

function translate_lang(text) {
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t&q=${text}`).then((response) => response.json()).then((data) => {
        document.querySelector(".temp").innerHTML = String(data[0][0][0]).toLowerCase();
    }).catch((error) => {
        console.error("Error:", error);
    });
}

recognition.onresult = function (event) {
    const text = String(event.results[0][0].transcript);
    translate_lang(text);
};

recognition.addEventListener("speechend", () => {
    sleep(300).then(() => {
        var responses = JSON.parse(document.querySelector(".temp2").innerHTML);
        let translated_text = String(document.querySelector(".temp").innerHTML);
        if (translated_text.charAt(translated_text.length - 1) == "." || translated_text.charAt(translated_text.length - 1) == "!") {
            translated_text = translated_text.slice(0, -1);
        }
        let func = analyze_func(translated_text, responses);
        console.log("Command:", func);
        if (func == "what song") {
            spotify_song();
            sleep(250).then(() => {
                let sentence = responses[func][Math.floor(Math.random() * responses[func].length)].replace("___", sessionStorage.getItem("current song")).replace("---", sessionStorage.getItem("current artist"));
                console.log("CloVA:", sentence);
                // speak(sentence);
                // sleep(1500).then(() => {
                //   document.querySelector(".voice_audio").play();
                //   document.querySelector(".voice_audio").onended = () => {
                recognition.start();
                //   };
                // });
            });
        } else if (document.querySelector(".temp").innerHTML != "") {
            console.log("CloVA:", responses[func][Math.floor(Math.random() * responses[func].length)]);
            //   speak(responses[func][Math.floor(Math.random() * responses[func].length)]);
            //   sleep(1500).then(() => {
            //     document.querySelector(".voice_audio").play();
            //     document.querySelector(".voice_audio").onended = () => {
            recognition.start();
            do_that_func(func);
            //     };
            //   });
        } else {
            recognition.start();
        }
        document.querySelector(".temp").innerHTML = "";
    });
});

// Text to speech

function speak(text) {
    const voiceId = "jsCqWAovK2LkecY7zXl4";
    const apiKey = "sk_02509493f54f5cc3d11ab239c8983022b620ee81d105e0fe"; //    3,344 / 10,000    Smith S.
    //   const apiKey = "sk_3e8f5e9eda81cc7c63d1023d3269cc506ef707d2e1339266"; //    10,000 / 10,000    Chitralada
    //   const apiKey = "sk_a61c0f95f89170154bffa7f4be4eac58b789e759dd7391e5"; //    10,000 / 10,000    Wyntor

    const headers = new Headers();
    headers.append("Accept", "audio/mpeg");
    headers.append("xi-api-key", apiKey);
    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    });

    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`, { method: "POST", headers: headers, body: body, }).then((response) => {
        if (response.ok) {
            return response.blob();
        } else {
        }
    }).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        document.querySelector(".voice_audio").src = url;
    }).catch((error) => {
        console.error("Error:", error);
        status.innerText += "\nError: " + error.message;
    });
}

window.onload = function () {
    //   sleep(50).then(() => {
    //     var responses = JSON.parse(document.querySelector(".temp2").innerHTML);
    //     speak(responses["greetings"][Math.floor(Math.random() * responses["greetings"].length)]);
    //     document.querySelector(".voice_audio").play();
    //     document.querySelector(".voice_audio").onended = () => {
    //       recognition.start();
    //     };
    //   });

    document.querySelector(".left_panel").style.opacity = "1";
    document.querySelector(".right_panel").style.opacity = "1";
    document.querySelector(".left_panel").style.left = "0";
    document.querySelector(".right_panel").style.right = "0";
    document.querySelector(".container").style.opacity = "1";
    document.querySelector(".container").style.scale = "1";
    document.querySelector(".text_group").style.opacity = "1";
    document.querySelector(".text_group").style.scale = "1";
    sleep(500).then(() => {
        document.querySelector(".container").style.boxShadow = "0 0 5dvw .5dvw #7bacd4";
        sleep(500).then(() => {
            document.querySelector(".right_txt").style.animationPlayState = "running";
        })
    })

    sleep(100).then(() => {
        recognition.start();
        // if (window.confirm('Ok to Connect to Spotify, Cancel to Skip')) {
        //     const authURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
        //     window.location.href = authURL;
        // };
    });
};