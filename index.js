String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const format = require('./format.js');

const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const logFolder = path.join(__dirname, 'boss_logs');
if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);

module.exports = function BossSkillLogger(dispatch) {    

	let enabled = config.enabled,
		writeLog = config.writeLog,
		cid = null,
		party = [],
		bosshp;

	var stream;

	dispatch.command.add('bsl', () => {
		enabled = !enabled;
		dispatch.command.message('记录王的技能ID ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));

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

	dispatch.hook('S_LOGIN', 10, (event) => {
		cid = event.gameId;
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
/* 
	dispatch.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
		party = event;
	})
 */
	dispatch.hook('S_BOSS_GAGE_INFO', 3, (event) => { 
		bosshp = Math.floor((event.curHp / event.maxHp)*10000)/100;
	})

	dispatch.hook('S_DUNGEON_EVENT_MESSAGE', 2, (event) => {
		if (!enabled) return;
		sendChat('MSG: ' + `${event.message}`.clr('00FFFF'));
		if (writeLog)
			stream.write(
				'\n' + new Date().toLocaleTimeString() + 
				' |S_DUNGEON_EVENT_MESSAGE|:	' + event.message
			);
	})

	dispatch.hook('S_ACTION_STAGE', 8, (event) => {
		if (!enabled || ((event.gameId - cid) == 0)) return;

		// for (let i in party.members) {
			// if (party.members[i].gameId - event.gameId == 0) return;
		// }

		if (event.templateId!=1000 && event.templateId!=2000 && event.templateId!=3000) return;
		if (event.stage > 0) return;
		sendChat(
			'ACT: ' + `${event.skill}`.clr('E69F00') + 
			` ${event.skill.id}`.clr('56B4E9') + 
			` HP ${bosshp} %`.clr('00FFFF')
		);
		if (writeLog)
			stream.write(
				'\n' + new Date().toLocaleTimeString() + 
				' |S_ACTION_STAGE|:		' + event.gameId + 
				'	skill: ' + event.skill + 
				'	id: ' + event.id + 
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
