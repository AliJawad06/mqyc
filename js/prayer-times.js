/* global fetch */
(function () {
	'use strict';

	var prayerTimeElements = document.querySelectorAll('[data-prayer-time]');
	function setPrayerTimes(timings) {
		prayerTimeElements.forEach(function (element) {
			var time = timings[element.getAttribute('data-prayer-time')];
			if (time) {
				element.textContent = formatTime12(time);
			}
		});

		setIqamaTime('Fajr', timings.Sunrise, -40);
		setIqamaTime('Asr', timings.Asr, 15);
		setIqamaTime('Maghrib', timings.Maghrib, 5);
	}

	function setIqamaTime(prayer, sourceTime, minutesOffset) {
		var element = document.querySelector('[data-iqama-time="' + prayer + '"]');
		if (!element || !sourceTime) {
			return;
		}

		var match = sourceTime.match(/(\d{1,2}):(\d{2})/);
		if (!match) {
			return;
		}

		var minutes = (Number(match[1]) * 60 + Number(match[2]) + minutesOffset + 1440) % 1440;
		element.textContent = formatTime12(String(Math.floor(minutes / 60)) + ':' +
			String(minutes % 60).padStart(2, '0'));
	}

	function formatTime12(time) {
		var match = time.match(/(\d{1,2}):(\d{2})/);
		if (!match) {
			return time;
		}

		var hours = Number(match[1]);
		var suffix = hours >= 12 ? 'PM' : 'AM';
		var displayHours = hours % 12 || 12;
		return displayHours + ':' + match[2] + ' ' + suffix;
	}

	function loadPrayerTimes() {
		// Raleigh, North Carolina
		var latitude = 35.7796;
		var longitude = -78.6382;
		var today = new Date();
		var date = String(today.getFullYear()) +
			String(today.getMonth() + 1).padStart(2, '0') +
			String(today.getDate()).padStart(2, '0');
		var url = 'https://api.aladhan.com/v1/timings/' + date +
			'?latitude=' + encodeURIComponent(latitude) +
			'&longitude=' + encodeURIComponent(longitude) +
			'&school=0'; // 0 = Shafi'i; this controls the Asr calculation.

		fetch(url)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Unable to load prayer times.');
				}
				return response.json();
			})
			.then(function (result) {
				if (result.code === 200 && result.data && result.data.timings) {
					setPrayerTimes(result.data.timings);
				}
			})
			.catch(function () {
				// Keep the --:-- fallback visible if the API is unavailable.
			});
	}

	if (!prayerTimeElements.length) {
		return;
	}

	loadPrayerTimes();
}());
