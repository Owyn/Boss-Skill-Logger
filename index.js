String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };

const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const logFolder = path.join(__dirname, 'boss_logs');
if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);

module.exports = function BossSkillLogger(dispatch) {    

	let enabled = config.enabled,
		writeLog = config.writeLog,
		party = [],
		bosshp;

	var stream;

	dispatch.command.add('bsl', () => {
		enabled = !enabled;
		dispatch.command.message(' is now ' + (enabled ? 'ON'.clr('56B4E9') : 'OFF'.clr('E69F00')));

		if (writeLog) { 
			if (enabled) {
				let filename = path.join(logFolder, Date.now() + '.js');
				stream = fs.createWriteStream(filename);
			} else {
				if (stream) {
					try {
						stream.end();
					} catch (e) {
						console.log(e);
					}
				}
			}
		}
	})

	dispatch.hook('S_EXIT', 3, (event) => {
		if (stream) {
			try {
				stream.end();
			} catch (e) {
				console.log(e);
			}
		}
	})

	let boss_id = 0n;
	dispatch.hook('S_BOSS_GAGE_INFO', 3, (event) => { 
		if (!enabled) return;
		
		if(boss_id !== event.id)
		{
			boss_id = event.id;
			sendChat('BOSS: id: ' + String(event.id) +', huntingZoneId: ' + `${event.huntingZoneId}`.clr('00FFFF') + ', templateId: ' + `${event.templateId}`.clr('00FFFF'));
			if (writeLog)
				stream.write(
					'\n' + new Date().toLocaleTimeString() + 
					' |S_BOSS_GAGE_INFO|:	gameId: ' + String(event.id) +
					' 	huntingZoneId: ' + event.huntingZoneId +
					' 	templateId: ' + event.templateId
				);
		}
		bosshp = String(event.curHp * 100n / event.maxHp);
	})

	dispatch.hook('S_DUNGEON_EVENT_MESSAGE', 2, (event) => {
		if (!enabled) return;
		sendChat('MSG: ' + `${event.message}`.clr('E69F00') + ` HP ${bosshp}%`.clr('00FFFF'));
		if (writeLog)
			stream.write(
				'\n' + new Date().toLocaleTimeString() + 
				' |S_DUNG_MESSAGE|:		' + event.message +
				` HP ${bosshp}%`
			);
	})
	
	dispatch.hook('S_LOAD_TOPO', 3, (event) => {
		if (!enabled) return;
		sendChat('Entering zone: ' + `${event.zone}`.clr('00FFFF'));
		if (writeLog)
			stream.write(
				'\n' + new Date().toLocaleTimeString() + 
				' |S_LOAD_TOPO|:	' + event.zone
			);
	})

	dispatch.hook('S_ACTION_STAGE', 9, (event) => {
		if (!enabled) return;
		if (event.templateId!=1000 && event.templateId!=2000 && event.templateId!=3000 && event.gameId!=boss_id) return;
		if (event.stage > 0) return;
		
		sendChat(
			'SKILL: ' + `${event.skill.id % 1000}`.clr('E69F00') + 
			` HP ${bosshp}%`.clr('00FFFF')
		);
		if (writeLog)
			stream.write(
				'\n' + new Date().toLocaleTimeString() + 
				' |S_ACTION_STAGE|:		gameId: ' + String(event.gameId) + 
				'	skill id: ' + event.skill.id + 
				'	stage: ' + event.stage + 
				'	templateId: ' + event.templateId +
				'	HP: ' + bosshp
			);
	})

    function getTime() {
        var time = new Date();
        var timeStr = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + ":" + ("0" + time.getSeconds()).slice(-2);
        return timeStr;
    }
    
    function sendChat(msg) {
		dispatch.command.message(
			//getTime() + ' - ' + msg
			msg
		)
    }

}
