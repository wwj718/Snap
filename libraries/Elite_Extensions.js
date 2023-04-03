let audio;
let wait_audio;
SnapExtensions.primitives.set(
    'elite_speechcx_read(content, per, spd, pit, vol)',
    function (content, per, spd, pit, vol) {

        var voice_menus = {
            '磁性男声': 5003,
            '情感男声': 106,
            '活泼男童': 110,
            '甜美女声': 103,
            '情感女声': 5118,
            '可爱女童1': 111,
            '可爱女童2': 4
        };
        // https://ai.eliteu.cn/wxapi/tts?text=%E4%BD%A0%E5%A5%BD&per=5003&spd=5&pit=5&vol=5
        // per 是声音的类型 
        const apiURL = 'https://ai.eliteu.cn/wxapi/tts?text='+content+'&per='+ voice_menus[per]+'&spd='+ spd+'&pit='+ pit+'&vol='+ vol;
        
        // playAudioFromAPI(apiURL);
        playAudioFromAPI(apiURL);
        return "I am reading text=" + content+"&per="+ per+"&spd="+ spd+"&pit="+ pit+"&vol="+ vol;
    }
);

async function playAudioFromAPI(apiURL) {
  console.log('start playing audio');
  audio = new Audio(apiURL);
  await audio.play();
  console.log('audio finished playing');
}
// function playAudioFromAPI(apiURL) {
//   fetch(apiURL)
//     .then(response => response.arrayBuffer())
//     .then(arrayBuffer => {
//       var audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       audioContext.decodeAudioData(arrayBuffer, function(buffer) {
//         var source = audioContext.createBufferSource();
//         source.buffer = buffer;
//         source.connect(audioContext.destination);
//         source.start(0);
//         audioSource = source;
//         alert(audioSource)
//       }, function(e) {
//         console.log('Error decoding audio data', e);
//       });
//     })
//     .catch(error => {
//       console.log('Error fetching audio data', error);
//     });
// }

SnapExtensions.primitives.set(
    'elite_speechcx_read_ended(content, per, spd, pit, vol)',
    function (content, per, spd, pit, vol) {
      var voice_menus = {
          '磁性男声': 5003,
          '情感男声': 106,
          '活泼男童': 110,
          '甜美女声': 103,
          '情感女声': 5118,
          '可爱女童1': 111,
          '可爱女童2': 4
      };
      // per 是声音的类型 
      const apiURL = 'https://ai.eliteu.cn/wxapi/tts?text='+content+'&per='+ voice_menus[per]+'&spd='+ spd+'&pit='+ pit+'&vol='+ vol;
        
      //playAudioFromAPIEnded(apiURL);
      //console.log('audio finished playing');
      return playAudioFromAPIEnded(apiURL).then(()=>{
        console.log('audio finished playing');
      }).catch((error) => {
        console.log(error);
      })
  }
);

function playAudioFromAPIEnded(apiURL) {
  console.log('start playing audio');
  wait_audio = new Audio(apiURL);
  wait_audio.currentTime = 0;
  return wait_audio.play();
}

SnapExtensions.primitives.set(
  'elite_speechcx_stop()',
  function () {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
        return;
    }
    if (wait_audio) {
      wait_audio.pause();
      wait_audio.currentTime = 0;
      wait_audio = null;
      return;
  }
}
);


// function playAudioFromAPIEnded(apiURL) {
//     // 创建一个 Promise 对象
//     return new Promise(function(resolve, reject) {
//       console.log("-----------playAudioFromAPI----------------");
//       var request = new XMLHttpRequest();
//       request.open('GET', apiURL, true);
//       request.responseType = 'arraybuffer';
  
//       request.onload = function() {
//         var audioData = request.response;
//         var audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         audioContext.decodeAudioData(audioData, function(buffer) {
//           var source = audioContext.createBufferSource();
//           source.buffer = buffer;
//           source.connect(audioContext.destination);
//           source.start(0);
  
//           // 在音频播放结束时，resolve Promise
//           source.onended = function() {
//             resolve();
//           };
//         }, function(e) {
//           console.log('Error decoding audio data', e);
//           reject(e); // 出错时，reject Promise
//         });
//       };
  
//       request.send();
//     });
//   }
