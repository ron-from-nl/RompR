var sleepTimer = function() {

	var inctimer = null;
	var inctime = 500;
	var incamount = null;
	var timeset = 0;
	var polltimer;
	var boxtimer;

	return {

		startInc: function(amount) {
			debug.log('SLEEPTIMER', 'StartINC');
			incamount = amount;
			inctime = 500;
			sleepTimer.runIncrement();
		},

		runIncrement: function() {
			clearTimeout(inctimer);
			prefs.sleeptime += incamount;
			if (prefs.sleeptime < 0) {
				prefs.sleeptime = 0;
			}
			sleepTimer.setBoxes();
			inctimer = setTimeout(sleepTimer.runIncrement, inctime);
			inctime -= 50;
			if (inctime < 50) {
				inctime = 50;
			}
		},

		stopInc: function() {
			clearTimeout(inctimer);
			prefs.save({sleeptime: prefs.sleeptime});
			sleepTimer.setTimer(false);
		},

		setBoxes: function() {
			clearTimeout(boxtimer);
			$("#sleepminutes").html(prefs.sleeptime.toString());
			if (timeset == 0) {
				$('#sleepruntime').html('');
			} else {
				let html = '<i class="icon-sleep svg-square"></i>';
				let runtime = Math.round((prefs.sleeptime * 60) - ((Date.now() / 1000) - timeset));
				if (runtime > 0) {
					let mins = Math.floor(runtime/60);
					let seconds = zeroPad((runtime % 60), 2);
					html = mins+':'+seconds;
					boxtimer = setTimeout(sleepTimer.setBoxes, 1000);
				}
				$('#sleepruntime').html(html);
			}
		},

		toggle: function() {
			sleepTimer.setButton();
			sleepTimer.setTimer(true);
		},

		setButton: function() {
			if (prefs.sleepon) {
				$("#sleeptimer_icon").removeClass('currentbun').addClass('currentbun');
				$('#sleepon').prop('checked', true);
			} else {
				$("#sleeptimer_icon").removeClass('currentbun');
				$('#sleepon').prop('checked', false);
			}
		},

		setTimer: async function(toggled) {
			clearTimeout(polltimer);
			let enable = (prefs.sleepon) ? '1' : '0';
			if (toggled || prefs.sleepon) {
				let state = await $.ajax({
					type: 'GET',
					url: 'api/sleeptimer/?enable='+enable+'&sleeptime='+prefs.sleeptime.toString()
				});
				sleepTimer.process_state(state);
			}
			sleepTimer.set_poll_timer();
		},

		pollState: async function() {
			clearTimeout(polltimer);
			debug.log('SLEEPTIMER', 'Polling');
			let state = await $.ajax({
				type: 'GET',
				url: 'api/sleeptimer/?poll=1'
			});
			sleepTimer.process_state(state);
			sleepTimer.set_poll_timer();
		},

		set_poll_timer: function() {
			let timeout = (prefs.sleepon) ? 10000 : 60000;
			polltimer = setTimeout(sleepTimer.pollState, timeout);
		},

		process_state: function(state) {

			debug.log('SLEEPTIMER', state);

			prefs.save({sleepon: (state.state == 1)});
			if (state.sleeptime) {
				prefs.save({sleeptime: parseInt(state.sleeptime)});
			}
			timeset = parseInt(state.timeset);
			sleepTimer.setButton();
			sleepTimer.setBoxes();
		},

		browser_sleep: function() {
			clearTimeout(polltimer);
			clearTimeout(boxtimer);
		},

		fakeClick: function() {
			$('#sleepon').trigger('click');
		},

		setup: function() {
			var d = uiHelper.createPluginHolder('icon-sleep', language.gettext('button_sleep'), 'sleeptimer_icon', 'sleeppanel');
			if (d === false) {
				return false;
			}
			var holder = uiHelper.makeDropHolder('sleeppanel', d, false, false);
			var html = uiHelper.ui_config_header({label: 'button_sleep', icon_size: 'smallicon'});
			html += '<input type="hidden" class="helplink" value="https://fatg3erman.github.io/RompR/Alarm-And-Sleep#sleep-timer" />'+
				'<div class="noselection">'+
				'<table width="90%" align="center">'+
				'<tr>'+
				'<td align="center"><i class="icon-increase smallicon clickicon" onmousedown="sleepTimer.startInc(1)" onmouseup="sleepTimer.stopInc()"></i></td>'+
				'<td></td>'+
				'</tr>'+
				'<tr>'+
				'<td align="center" class="alarmnumbers" id="sleepminutes">12</td>'+
				'<td align="right" class="alarmnumbers" id="sleepruntime"</td>' +
				'</tr>'+
				'<tr>'+
				'<td align="center"><i class="icon-decrease smallicon clickicon" onmousedown="sleepTimer.startInc(-1)" onmouseup="sleepTimer.stopInc()"></i></td>'+
				'<td></td>'+
				'</tr>'+
				'<tr>'+
				'<td><div class="styledinputs textcentre"><input type="checkbox" class="autoset toggle" id="sleepon"><label for="sleepon">ON</label></div></td>'+
				'<td></td>'+
				'</tr>'+
				'</table>';
			// html += '<table align="center" width="95%">';
			// html += '<tr>';
			// html += '<td colspan="3"><div class="styledinputs textcentre"><input type="checkbox" class="autoset toggle" id="sleepon"><label for="sleepon">ON</label></div></td>';
			// html += '</tr>';
			// html += '</table>';
			html += '</div>';
			holder.html(html);
			sleepTimer.pollState();
			if (typeof(shortcuts) != 'undefined')
				shortcuts.add('button_sleep', sleepTimer.fakeClick, "Q");
		}

	}

}();

pluginManager.addPlugin("Sleep Timer", null, sleepTimer.setup, null, false);
sleepHelper.addWakeHelper(sleepTimer.pollState);
sleepHelper.addSleepHelper(sleepTimer.browser_sleep);

