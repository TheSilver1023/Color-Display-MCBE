import * as mc from '@minecraft/server'
import DB from 'database'

const RK = new DB('ra_ss');

function Handle(event) {
	if (event.itemStack.typeId != 'minecraft:compass') return;
	
	const { location, permutation } = event.block;
	const { x, y, z } = location;
	const key = `${x}/${y}/${z}`
	
	if (!RK.has(key)) {
		RK.set(key, location);
		mc.world.sendMessage(`Block added as ${x} ${y} ${z}`);
	} else {
		RK.remove(key);
		mc.world.sendMessage(`Block removed at ${key}`);
	}
}

const ov = mc.world.getDimension('overworld');
mc.system.runInterval(() => {
	
	const Blocks = RK.values().map(loc => ov.getBlock(loc));
	
	for (const block of Blocks) {
		const ss = block.permutation.getState('redstone_signal');
		if (ss == undefined) continue;
		const { x, y, z } = block.location;
		const vm = new mc.MolangVariableMap()
			vm.setFloat('x', ss * 16);
			
		ov.spawnParticle('ra:ss', vec3(x + 1.05, y + 0.5, z + 0.5), vm);
	}
}, 10);

function vec3(x, y, z) {
	return { x, y, z }
}


mc.world.afterEvents.itemUseOn.subscribe(Handle)