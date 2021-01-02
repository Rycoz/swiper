const mapID = 9950;

exports.NetworkMod = function Swiper(mod) {

	let hooks = [],
	enabled = false,
	toParty = false,
	uNames = [],
	count = [];

	mod.game.on('enter_game', () => {
		uNames[mod.game.me.gameId] = mod.game.me.name
	});

	mod.hook('S_LOAD_TOPO', 3, (event) => {
		if (event.zone === mapID){
			load();
		}else{
			unload();
		}
	});

	function load(){
		hook('S_SPAWN_USER', 17, event => {
			uNames[event.gameId] = event.name
		});

		hook('S_EACH_SKILL_RESULT', 14 , event =>{
			if(!enabled) return
			if(event.reaction['push'] && (event.skill['id']==1137 || event.skill['id']==1136) && !event.superArmor){
				mod.log(event);
				if(isNaN(count[uNames[event.target]])){
					count[uNames[event.target]] = 1;
				}else{
					count[uNames[event.target]] +=1;
				}

				sendMessage(uNames[event.target] + ' got swiped (' + count[uNames[event.target]] + ')');
			}

		})
	};

	function unload() {
		if (hooks.length) {
			for (let h of hooks) mod.unhook(h);
			hooks = [];
		}
	}

	function hook() {
		hooks.push(mod.hook(...arguments));
	}

	function sendMessage(msg){
		if(toParty){
			mod.toServer('C_CHAT', 1, {
			channel: 21, //21 = p-notice, 1 = party, 2 = guild
			message: msg
			});
		}else{
			mod.toClient('S_CHAT', 3, {
			channel: 21, //21 = p-notice, 1 = party
			name: 'Swiper',
			message: msg
			});
		}
	}

	mod.command.add('swiper', {
		$none() {

			if(enabled){
				enabled = false;
				mod.command.message('disabled');
			}else{
				enabled = true;
				mod.command.message('enabled');
			}
		},
		list() {
			mod.log(count)
		},
		clear() {
			count = [];
		}

	})
}
