import AudioMotionAnalyzer from 'https://cdn.skypack.dev/audiomotion-analyzer?min';

const videoEl = document.querySelector(".voice_audio"), container = document.querySelector(".container");

var presets = [
	{
		name: 'Defaults',
		options: undefined
	},
	{
		name: 'Classic LEDs',
		options: {
			mode: 3,
			barSpace: .5,
			bgAlpha: .7,
			colorMode: 'gradient',
			gradient: 'classic',
			ledBars: true,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexRatio: 0,
			showBgColor: true,
			showPeaks: true,
			overlay: true
		}
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 10,
			bgAlpha: .7,
			fillAlpha: .6,
			gradient: 'rainbow',
			lineWidth: 2,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showBgColor: false,
			showPeaks: false,
			overlay: true
		}
	},
	{
		name: 'Radial inverse',
		options: {
			mode: 3,
			barSpace: .1,
			bgAlpha: 0,
			fillAlpha: 0,
			gradient: 'steelblue',
			ledBars: true,
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxDecibels: -30,
			maxFreq: 16000,
			radial: true,
			radialInvert: true,
			showBgColor: true,
			showPeaks: true,
			spinSpeed: 0,
			outlineBars: true,
			overlay: true,
			weightingFilter: 'D'
		}
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: 5,
			barSpace: .25,
			bgAlpha: .5,
			colorMode: 'bar-level',
			gradient: 'prism',
			ledBars: false,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexAlpha: .5,
			reflexFit: true,
			reflexRatio: .3,
			showBgColor: false,
			showPeaks: true,
			overlay: true,
			outlineBars: false
		}
	}
];

try {
	var audioMotion = new AudioMotionAnalyzer( container, {
		source: videoEl,
		fsElement: container
	});
}
catch( err ) {
	container.innerHTML = `<p>audioMotion-analyzer failed with error: ${ err.code ? '<strong>' + err.code + '</strong>' : '' } <em>${ err.code ? err.message : err }</em></p>`;
}

function updateRangeElement( el ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' )
		s.innerText = el.value;
}

function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ el.dataset.setting ] );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] ) );
}

audioMotion.setOptions( presets[3].options );
updateUI();
