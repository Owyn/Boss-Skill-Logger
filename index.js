// vers 1.0.0

var fs = require('fs');
const format = require('./format.js');

module.exports = function BossSkillLogger(dispatch) {    
    
    let enabled = false,
    //bossId = 0,
    cid = null,
    party = [],
    writeLog = false,                      // Optionally write a log
    logFolder = './../../boss_logs/';      // "TeraProxy base folder"
    
    var stream;
        
    const chatHook = event => {     
        let command = format.stripTags(event.message).split(' ');
        
        if (['!bosslog'].includes(command[0].toLowerCase())) {
            toggleModule();
            return false;
        }
    }
    dispatch.hook('C_CHAT', 1, chatHook)    
    dispatch.hook('C_WHISPER', 1, chatHook)
    
    // slash support
    try {
        const Slash = require('slash')
        const slash = new Slash(dispatch)
        slash.on('bosslog', args => toggleModule())
    } catch (e) {
        // do nothing because slash is optional
    }
            
    function toggleModule() {
        enabled = !enabled;
        sendChat((enabled ? 'enabled' : 'disabled'));

        if (writeLog) { 
            if (enabled) {
                if (!fs.existsSync(logFolder))
                {
                    fs.mkdirSync(logFolder); 
                }             
                let filename = logFolder + Date.now() + '.txt';
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
    }
    
    dispatch.hook('S_LOGIN', 2, (event) => {
        cid = event.cid;
    })
    
    dispatch.hook('S_EXIT', 1, (event) => {
        if (stream) {
            try {
              stream.end();
            } catch (e) {
                console.log(e);
            }
        }
    })
    
    dispatch.hook('S_PARTY_MEMBER_LIST', 4, (event) => {
        party = event;
    })
                
     dispatch.hook('S_BOSS_GAGE_INFO', 2, (event) => { 
        if (!enabled) return;
        //bossId = event.id;
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_BOSS_GAGE_INFO  : ' + event.id + 
                '    hntngZnId: ' + event.huntingZoneId + 
                '    templateId: '+ event.templateId + 
                '    cupHp: ' + event.curHp + 
                '    maxHp: ' + event.maxHp + 
                '    unk1: ' + event.unk1 + 
                '    unk2(Enrage?): ' + event.unk2 + 
                '    hpDiff: ' + event.hpDiff + 
                '    unk3: ' + event.unk3 + 
                '    hpPerc: ' + (event.curHp / event.maxHp));
     })     
            
    dispatch.hook('S_ACTION_STAGE', 1, (event) => {
        if (!enabled || (event.source - cid == 0)) return; // ignore self
        for (let i in party.members) {
            if (party.members[i].cID - event.source == 0) return; // ignore party
        }
        //if (event.source - bossId != 0) return; // ignore adds?
        if (event.stage > 0) return; // (Optional) ignore additional stages, one is usually enough.
        
        sendChat('S_ACT_STG: ' + event.skill + '    ' + event.stage);
        //sendChat('S_ACT_STG: ' + event.skill + '    ' + event.stage + '      ' + event.source);  // might be useful for adds
        
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_ACTION_STAGE    : ' + event.source + 
                '    model: ' + event.model + 
                '    skill: ' + event.skill + 
                '    stage: ' + event.stage + 
                '    id: ' + event.id + 
                '    unk: ' + event.unk + 
                '    unk1: ' + event.unk1 + 
                '    unk2: ' + event.unk2 + 
                '    unk3: ' + event.unk3 + 
                '    speed: ' + event.speed);
    })  
                
    dispatch.hook('S_ACTION_END', 1, (event) => {
        if (!enabled || (event.source - cid == 0)) return; // ignore self
        for (let i in party.members) {
            if (party.members[i].cID - event.source == 0) return; // ignore party
        }
        //if (event.source - bossId != 0) return; // ignore adds?
                
        sendChat('S_ACT_END: ' + event.skill);
        
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_ACTION_END      : ' + event.source + 
                '    model: ' + event.model + 
                '    skill: ' + event.skill + 
                '    type: ' + event.type + 
                '    id: ' + event.id);
    })  
    
     dispatch.hook('S_CHAT', 1, (event) => {
         if (!enabled) return;
         if (event.channel == 1 || event.channel == 21 || event.channel == 0) {
            if (writeLog) 
                stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_CHAT  : ' + event.authorName + 
                '    : ' + event.message );       
         }
     }) 
     
    dispatch.hook('S_DUNGEON_EVENT_MESSAGE', 1, (event) => {
        if (!enabled) return;
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_DUNGEON_EVENT_MESSAGE   : ' + event.message);
    })  
     
    dispatch.hook('C_MEET_BOSS_INFO', 1, (event) => {
        if (!enabled) return;
        sendChat('MEET_BOSS:  ' + event.huntingZoneId + '-' + event.templateId);

        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'C_MEET_BOSS_INFO' + 
                '    huntingZoneId: ' + event.huntingZoneId + 
                '    templateId: ' + event.templateId);
    })

    dispatch.hook('S_DUNGEON_EVENT_MESSAGE', 1, (event) => {
        if (!enabled) return;
        sendChat('DG_EVT_MSG: ' + event.message);
        
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_DUNGEON_EVENT_MESSAGE    ' + event.message);
    })
          
    function getTime() {
        var time = new Date();
        var timeStr = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + ":" + ("0" + time.getSeconds()).slice(-2);
        return timeStr;
    }
    
    function sendChat(msg) {
        dispatch.toClient('S_CHAT', 1, {
            channel: 1,
            authorName: 'Boss',
            message: (getTime() + ' ' + msg)
        });     
    }
             
     
/*      
    dispatch.hook('S_NPC_STATUS', 1, (event) => {
        if (!enabled) return;
        sendChat('Status:      ' + event.message)
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
            'S_NPC_STATUS   : ' + event.message);
    }) 
    
    dispatch.hook('S_NPC_SITUATION', 1, (event) => {
        if (!enabled) return;
        sendChat('NPC SIT....: ' + event.unk);
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_NPC_SITUATION   : ' + event.cid +    
                '      unk: ' + event.unk);
    })  
     
    dispatch.hook('S_NPC_AI_EVENT', 1, (event) => {
        if (!enabled) return;
        sendChat('AI Event   : ' + event.event);
        if (writeLog) 
            stream.write('\n' + new Date().toLocaleTimeString() + 
                'S_NPC_AI_EVENT    : ' + event.npc + 
                '    event: ' + event.event);
    })  
*/

}
