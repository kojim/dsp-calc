describe("Product", function() {
	it("歯車秒間0個に必要な組立機数は0", function() {
		expect(0).toEqual(iron_gear_wheel.require_builder_count(0));
	});
	it("歯車秒間1.5個に必要な組立機数は1", function() {
		expect(1).toEqual(iron_gear_wheel.require_builder_count(1.5));
	});
	it("歯車秒間15個に必要な組立機数は10", function() {
		expect(10).toEqual(iron_gear_wheel.require_builder_count(15));
	});
});
describe("Ore", function() {
	it("鉄鉱石秒間0個に必要な採掘機数は0", function() {
		expect(0).toEqual(iron_ore.require_builder_count(0));
	});
	it("鉄鉱石秒間0.526個に必要な採掘機数は約1", function() {
		expect(1).toBeCloseTo(iron_ore.require_builder_count(0.526), 2);
	});
});
describe("MetalPlate", function() {
	it("鉄板秒間0個に必要な溶鉱炉数は0", function() {
		expect(0).toEqual(iron_plate.require_builder_count(0));
	});
	it("鉄板秒間0.57個に必要な溶鉱炉数は1", function() {
		expect(1).toBeCloseTo(iron_plate.require_builder_count(0.57), 2);
	});
	it("鋼材秒間1.142個に必要な採掘機数は約10", function() {
		expect(10).toBeCloseTo(steel_plate.require_builder_count(1.142), 1);
	});
});
describe("Oil", function() {
	it("原油秒間0個に必要な油井数は0", function() {
		expect(0).toEqual(crude_oil.require_builder_count(0));
	});
	it("原油秒間5個に必要な油井数は1", function() {
		expect(1).toEqual(crude_oil.require_builder_count(5));
	});
});
describe("Dependency", function() {
	it("鉄板秒間0個に必要な素材はなし", function() {
		expect({"IronOre":0, "IronPlate":0}).toEqual(iron_plate.require_ingredient_count(0, []));
	});
	it("鉄板秒間1個に必要な素材は鉄板と鉄鉱石", function() {
		expect({"IronOre":1, "IronPlate":1}).toEqual(iron_plate.require_ingredient_count(1, []));
	});
	it("SP1秒間1個に必要な素材", function() {
		var ing = science_pack_1.require_ingredient_count(1, []);
		expect(6).toEqual(Object.keys(ing).length);
		expect(1).toBeCloseTo(ing['CopperOre'], 1);
		expect(1).toBeCloseTo(ing['CopperPlate']  , 1);
		expect(2).toBeCloseTo(ing['IronOre'], 1);
		expect(2).toBeCloseTo(ing['IronPlate']  , 1);
		expect(1).toBeCloseTo(ing['IronGearWheel']  , 1);
		expect(1.00000).toBeCloseTo(ing['SciencePack1'], 2);
	});
	it("SP1秒間1個に必要な素材(歯車搬入)", function() {
		var ing = science_pack_1.require_ingredient_count(1, ['IronGearWheel']);
		expect(6).toEqual(Object.keys(ing).length);
		expect(1).toBeCloseTo(ing['CopperOre'], 1);
		expect(1).toBeCloseTo(ing['CopperPlate']  , 1);
		expect(0).toBeCloseTo(ing['IronOre'], 1);
		expect(0).toBeCloseTo(ing['IronPlate']  , 1);
		expect(1).toBeCloseTo(ing['IronGearWheel']  , 1);
		expect(1.00000).toBeCloseTo(ing['SciencePack1'], 2);
	});
});
