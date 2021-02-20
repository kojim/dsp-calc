// -------------------------------------------
// クラス定義
// -------------------------------------------
// 生産物用抽象クラス
var Product = function(){};
Product.prototype = {
	/*
	 * 生産物を秒間 product_per_sec個作るのに必要な施設数
	 */
	require_builder_count: function(product_per_sec) {
		return product_per_sec / ((1/this.req_time) * this.result_count * this.build_rate);
	},
	/*
	 * 生産物を秒間 product_per_sec個作るのに必要な素材と量
	 * import_ingredientsに含まれる素材は計上しない
	 */
	require_ingredient_count: function(product_per_sec, import_ingredients) {
		var thiz = this;
		// 各素材の生産量を計算
		// map   : [{鉄:毎秒1}, {銅:毎秒2, 鉄:毎秒1}], {}] のようなリストを作る。
		// reduce: {鉄:毎秒3, 銅:毎秒2} ハッシュを作る。
		var result = this.ingredients.map(function(i) {
			var ingredient       = i[0]
			var ingredient_count = i[1];
			// 計算式:
			//   施設1つあたりの必要素材数
			//   / ビルド時間
			//   * 施設数
			var build_time     = thiz.req_time/thiz.build_rate;
			var ingredient_cps = ingredient_count / build_time * thiz.require_builder_count(product_per_sec);
			var result         = ingredient.require_ingredient_count(ingredient_cps, import_ingredients);
			return result;
		}).reduce(function(pre, cur) {
			$.each(cur, function(ingredient_name, ingredient_count) {
				if (pre[ingredient_name] === undefined) {
					// 値がまだないとき
					pre[ingredient_name] = 0;
				}
				pre[ingredient_name] += ingredient_count;
			});
			return pre;
		}, {});
		// 素材が搬入品に含まれていれば素材の素材の生産量は0に
		if ($.inArray(this.name, import_ingredients) !== -1) {
			$.each(Object.keys(result), function(i, name) {
				result[name] = 0;
			});
		}
		// 自分自身の生産量を付け足す
		result[this.name] = product_per_sec;
		return result;
	}
};

// 組立機で作るもの
var AssemblyProduct = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
AssemblyProduct.prototype = new Product();
AssemblyProduct.prototype.build_rate = 0.75;
AssemblyProduct.prototype.energy_usage = 150;

// 化学プラントで作るもの
var ChemicalProduct = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
ChemicalProduct.prototype = new Product();
ChemicalProduct.prototype.build_rate = 1.25;
ChemicalProduct.prototype.energy_usage = 210;

// 原油採掘
var PumpJack = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
PumpJack.prototype = new Product();
PumpJack.prototype.build_rate = 1;
PumpJack.prototype.energy_usage = 90;

// 原油精製
var OilRefinery = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
OilRefinery.prototype = new Product();
OilRefinery.prototype.build_rate = 1;
OilRefinery.prototype.energy_usage = 420;

// 採掘機で掘り出すもの
var Ore = function(name, name_jp, hardness, req_time) {
	this.name     = name;
	this.name_jp      = name_jp;
	this.hardness = hardness;
	this.req_time = req_time;
};
Ore.prototype = new Product();
Ore.prototype.ingredients = [];
Ore.prototype.energy_usage = 90;
Ore.prototype.require_builder_count =  function(product_per_sec) {
	var power = 3;
	var speed = 0.5;
	return product_per_sec / (((power - this.hardness) * speed) / this.req_time);
};

// 溶鉱炉で作るもの
var MetalPlate = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
MetalPlate.prototype = new Product();
MetalPlate.prototype.build_rate = 2;
MetalPlate.prototype.energy_usage = 180;


// -------------------------------------------
// データ定義
// -------------------------------------------
// -----------------
// 鉱石
// -----------------
var iron_ore = new Ore(
  "IronOre", "鉄鉱石", 0.9, 2
);
var copper_ore = new Ore(
  "CopperOre", "銅鉱石", 0.9, 2
);
var coal = new Ore(
  "Coal", "石炭", 0.9, 2
);
var stone = new Ore(
  "Stone", "石", 0.4, 2
);

// -----------------
// 精錬系
// -----------------
var iron_plate = new MetalPlate(
  "IronPlate", "鉄板", 3.5, 1, [[iron_ore, 1]]
);
var copper_plate = new MetalPlate(
  "CopperPlate", "銅板", 3.5, 1, [[copper_ore, 1]]
);
var stone_brick = new MetalPlate(
  "StoneBrick", "石レンガ", 3.5, 1, [[stone, 2]]
);
var steel_plate = new MetalPlate(
  "SteelPlate", "鋼材", 17.5, 1, [[iron_plate, 5]]
);
var concrete = new AssemblyProduct(
  "Concrete", "コンクリート", 10, 10, [[stone_brick, 5], [iron_ore, 1]]
);

// -----------------
// 原油系
// -----------------
var crude_oil = new PumpJack(
  "CrudeOil", "原油", 1, 5, []
);
var petroleum_gas = new OilRefinery(
  "PetroleumGas", "プロパンガス", 5, 5.5, [[crude_oil, 10]]
);
var light_oil = new OilRefinery(
  "LightOil", "軽油", 5, 4.5, [[crude_oil, 10]]
);
var heavy_oil = new OilRefinery(
  "HeavyOil", "重油", 5, 1, [[crude_oil, 10]]
);
var lubricant = new ChemicalProduct(
  "Lubricant", "潤滑油", 1, 1, [[heavy_oil, 1]]
);

// -----------------
// 化学系
// -----------------
var plastic_bar = new ChemicalProduct(
  "PlasticBar", "プラスチック棒", 1, 2, [[coal, 1], [petroleum_gas, 3]]
);
var sulfur = new ChemicalProduct(
  "Sulfur", "硫黄", 1, 2, [[petroleum_gas, 3]]
);
var sulfuric_acid = new ChemicalProduct(
  "SulfuricAcid", "硫酸", 1, 5, [[sulfur, 2], [iron_plate, 1]]
);
var explosives = new ChemicalProduct(
  "Explosives", "火薬", 5, 1, [[sulfur, 1], [coal, 1]]
);

// -----------------
// 中間素材
// -----------------
var iron_gear_wheel = new AssemblyProduct(
  "IronGearWheel", "歯車", 0.5, 1, [[iron_plate, 2]]
);
var copper_cable = new AssemblyProduct(
  "CopperCable", "銅線", 0.5, 2, [[copper_plate, 1]]
);
var pipe = new AssemblyProduct(
  "Pipe", "パイプ", 0.5, 1, [[iron_plate, 1]]
);
var electronic_circuit = new AssemblyProduct(
  "ElectronicCircuit", "電子回路", 0.5, 1, [[iron_plate, 1], [copper_cable, 3]]
);
var advanced_circuit = new AssemblyProduct(
  "AdvancedCircuit", "発展回路", 8, 1, [[electronic_circuit, 2], [plastic_bar, 2], [copper_cable, 4]]
);
var processing_unit = new AssemblyProduct(
  "ProcessingUnit", "制御基板", 15, 1, [[electronic_circuit, 20], [advanced_circuit, 2], [sulfuric_acid, 0.5]]
);
var electronic_drill = new AssemblyProduct(
  "ElectronicDrill", "電動ドリル", 2, 1, [[steel_plate, 10], [iron_gear_wheel, 5], [electronic_circuit, 3]]
);

// -----------------
// 物流系
// -----------------
var basic_transport_belt = new AssemblyProduct(
  "BasicTransportBelt", "ベルトコンベア", 0.5, 2, [[iron_plate, 1], [iron_gear_wheel, 1]]
);
var fast_transport_belt = new AssemblyProduct(
  "FastTransportBelt", "高速ベルトコンベア", 0.5, 1, [[basic_transport_belt, 1], [iron_gear_wheel, 5]]
);
var express_transport_belt = new AssemblyProduct(
  "ExpressTransportBelt", "超高速ベルトコンベア", 0.5, 1, [[fast_transport_belt, 1], [iron_gear_wheel, 5], [lubricant, 2]]
);
var basic_underground_belt = new AssemblyProduct(
  "BasicUndergroundBelt", "地下輸送ベルト", 1, 2, [[iron_plate, 10], [basic_transport_belt, 5]]
);
var fast_underground_belt = new AssemblyProduct(
  "FastUndergroundBelt", "高速地下輸送ベルト", 0.5, 2, [[iron_gear_wheel, 20], [basic_underground_belt, 2]]
);
var express_underground_belt = new AssemblyProduct(
  "ExpressUndergroundBelt", "超高速地下輸送ベルト", 0.5, 2, [[iron_gear_wheel, 40], [fast_underground_belt, 2], [lubricant, 4]]
);
var splitter = new AssemblyProduct(
  "Splitter", "分配器", 1, 1, [[electronic_circuit, 5], [iron_plate, 5], [basic_transport_belt, 4]]
);
var fast_splitter = new AssemblyProduct(
  "FastSplitter", "高速分配器", 2, 1, [[splitter, 1], [iron_gear_wheel, 10], [electronic_circuit, 10]]
);
var express_splitter = new AssemblyProduct(
  "ExpressSplitter", "超高速分配器", 2, 1, [[fast_splitter, 1], [iron_gear_wheel, 10], [advanced_circuit, 10], [lubricant, 8]]
);
var basic_inserter = new AssemblyProduct(
  "BasicInserter", "インサーター", 0.5, 1, [[electronic_circuit, 1], [iron_gear_wheel, 1], [iron_plate, 1]]
);
var fast_inserter = new AssemblyProduct(
  "FastInserter", "高速インサーター", 0.5, 1, [[electronic_circuit, 2], [iron_plate, 2], [basic_inserter, 1]]
);
var filter_inserter = new AssemblyProduct(
  "FilterInserter", "フィルターインサーター", 0.5, 1, [[fast_inserter, 1], [electronic_circuit, 4]]
);
var stack_inserter = new AssemblyProduct(
  "StackInserter", "スタックインサーター", 0.5, 1, [[fast_inserter, 1], [iron_gear_wheel, 15], [electronic_circuit, 15], [advanced_circuit, 1]]
);
var stack_filter_inserter = new AssemblyProduct(
  "StackFilterInserter", "スタックフィルターインサーター", 0.5, 1, [[stack_inserter, 1], [electronic_circuit, 5]]
);

// -----------------
// 機械類
// -----------------
var battery = new ChemicalProduct(
  "Battery", "電池", 5, 1, [[sulfuric_acid, 2], [iron_plate, 1], [copper_plate, 1]]
);
var engine_unit = new AssemblyProduct(
  "EngineUnit", "エンジンユニット", 20, 1, [[steel_plate, 1], [iron_gear_wheel, 1], [pipe, 2]]
);
var electric_engine_unit = new AssemblyProduct(
  "ElectricEngineUnit", "電気エンジンユニット", 20, 1, [[engine_unit, 1], [lubricant, 2], [electronic_circuit, 2]]
);
var flying_robot_frame = new AssemblyProduct(
  "FlyingRobotFrame", "飛行ロボットフレーム", 20, 1, [[electric_engine_unit, 1], [battery, 2], [steel_plate, 1], [electronic_circuit, 3]]
);

// -----------------
// 電気系
// -----------------
var solar_panel = new AssemblyProduct(
  "SolarPanel", "ソーラーパネル", 10, 1, [[steel_plate, 5], [electronic_circuit, 15], [copper_plate, 5]]
);
var basic_accumulator = new AssemblyProduct(
  "BasicAccumulator", "蓄電池", 10, 1, [[iron_plate, 2], [battery, 5]]
);

// -----------------
// モジュール
// -----------------
var speed_module1 = new AssemblyProduct(
  "SpeedModule1", "生産速度モジュール1", 15, 1, [[electronic_circuit, 5], [advanced_circuit, 5]]
);
var speed_module2 = new AssemblyProduct(
  "SpeedModule2", "生産速度モジュール2", 30, 1, [[speed_module1, 4], [advanced_circuit, 5], [processing_unit, 5]]
);
var speed_module3 = new AssemblyProduct(
  "SpeedModule3", "生産速度モジュール3", 60, 1, [[speed_module2, 4], [advanced_circuit, 5], [processing_unit, 5]]
);
var productivity_module1 = new AssemblyProduct(
  "ProductivityModule1", "生産力モジュール1", 15, 1, [[electronic_circuit, 5], [advanced_circuit, 5]]
);
var productivity_module2 = new AssemblyProduct(
  "ProductivityModule2", "生産力モジュール2", 30, 1, [[productivity_module1, 4], [advanced_circuit, 5], [processing_unit, 5]]
);
var productivity_module3 = new AssemblyProduct(
  "ProductivityModule3", "生産力モジュール3", 60, 1, [[productivity_module2, 5], [advanced_circuit, 5], [processing_unit, 5]]
);
var effectivity_module1 = new AssemblyProduct(
  "EffectivityModule1", "エネルギー効率モジュール1", 15, 1, [[electronic_circuit, 5], [advanced_circuit, 5]]
);
var effectivity_module2 = new AssemblyProduct(
  "EffectivityModule2", "エネルギー効率モジュール2", 30, 1, [[effectivity_module1, 4], [advanced_circuit, 5], [processing_unit, 5]]
);
var effectivity_module3 = new AssemblyProduct(
  "EffectivityModule3", "エネルギー効率モジュール3", 60, 1, [[effectivity_module2, 5], [advanced_circuit, 5], [processing_unit, 5]]
);

// -----------------
// 戦闘系
// -----------------
var stone_wall = new AssemblyProduct(
  "StoneWall", "石壁", 0.5, 1, [[stone_brick, 5]]
);
var basic_bullet_magazine = new AssemblyProduct(
  "BasicBulletMagazine", "通常弾薬", 2, 1, [[iron_plate, 2]]
);
var piercing_bullet_magazine = new AssemblyProduct(
  "PiercingBulletMagazine", "貫通弾薬", 3, 1, [[copper_plate, 5], [steel_plate, 1]]
);
var granade = new AssemblyProduct(
  "Granade", "グレネード", 8, 1, [[coal, 10], [iron_plate, 5]]
);
var gun_turret = new AssemblyProduct(
  "GunTurret", "ガンタレット", 8, 1, [[steel_plate, 20], [copper_plate, 10], [iron_gear_wheel, 10]]
);
var laser_turret = new AssemblyProduct(
  "LaserTurret", "レーザータレット", 20, 1, [[steel_plate, 20], [electronic_circuit, 20], [battery, 12]]
);
var rocket = new AssemblyProduct(
  "Rocket", "ロケット弾", 8, 1, [[electronic_circuit, 1], [explosives, 2], [iron_plate, 2]]
);
var power_armor_mk2 = new AssemblyProduct(
  "PowerArmorMK2", "パワーアーマーMK2", 25, 1, [[effectivity_module3, 5], [speed_module3, 5], [processing_unit, 200], [steel_plate, 50]]
);
// -----------------
// ロケット関係
// -----------------
var solid_fuel = new ChemicalProduct(
  "SolidFuel", "固形燃料", 3, 1, [[light_oil, 1]]
);
var rocket_fuel = new AssemblyProduct(
  "RocketFuel", "ロケット燃料", 30, 1, [[solid_fuel, 10]]
);
var rocket_control_unit = new AssemblyProduct(
  "RocketControlUnit", "ロケット制御ユニット", 30, 1, [[processing_unit, 1], [speed_module1, 1]]
);
var low_density_structure = new AssemblyProduct(
  "LowDensityStructure", "断熱材", 30, 1, [[steel_plate, 10], [copper_plate, 5], [plastic_bar, 5]]
);

// -----------------
// 組立機
// -----------------
var assembling_machine_1 = new AssemblyProduct(
  "AssemblingMachine1", "組立機1", 0.5, 1, [[electronic_circuit, 3], [iron_gear_wheel, 5], [iron_plate, 9]]
);
var assembling_machine_2 = new AssemblyProduct(
  "AssemblingMachine2", "組立機2", 0.5, 1, [[electronic_circuit, 3], [iron_gear_wheel, 5], [iron_plate, 9], [assembling_machine_1, 1]]
);
var assembling_machine_3 = new AssemblyProduct(
  "AssemblingMachine3", "組立機3", 0.5, 1, [[assembling_machine_2, 2], [speed_module1, 4]]
);

// -----------------
// サイエンスパック
// -----------------
var science_pack_1 = new AssemblyProduct(
  "SciencePack1", "サイエンスパック1", 5, 1, [[copper_plate, 1], [iron_gear_wheel, 1]]
);
var science_pack_2 = new AssemblyProduct(
  "SciencePack2", "サイエンスパック2", 6, 1, [[basic_transport_belt, 1], [basic_inserter, 1]]
);
var science_pack_3 = new AssemblyProduct(
  "SciencePack3", "サイエンスパック3", 12, 1, [[advanced_circuit, 1], [engine_unit, 1], [electronic_drill, 1]]
);
var millitary_pack = new AssemblyProduct(
  "MillitaryPack", "軍事サイエンスパック", 10, 1, [[piercing_bullet_magazine, 1], [granade, 1], [gun_turret, 1]]
);

var products = [
	iron_ore, copper_ore, coal, stone, iron_plate, copper_plate, stone_brick, steel_plate, concrete, electronic_drill,
	crude_oil, petroleum_gas, light_oil, heavy_oil, lubricant,
	iron_gear_wheel, copper_cable, pipe, electronic_circuit, advanced_circuit, processing_unit,
	basic_transport_belt, fast_transport_belt, express_transport_belt,
	basic_underground_belt, fast_underground_belt, express_underground_belt,
	splitter, fast_splitter, express_splitter,
	basic_inserter, fast_inserter, filter_inserter, stack_inserter, stack_filter_inserter,
	plastic_bar, sulfur, sulfuric_acid, explosives,
	battery, engine_unit, electric_engine_unit, flying_robot_frame,
	solar_panel, basic_accumulator,
	speed_module1, speed_module2, speed_module3,
	productivity_module1, productivity_module2, productivity_module3,
	effectivity_module1, effectivity_module2, effectivity_module3,
	stone_wall, basic_bullet_magazine, piercing_bullet_magazine, granade, gun_turret, laser_turret, rocket, power_armor_mk2,
	solid_fuel, rocket_fuel, rocket_control_unit, low_density_structure,
	assembling_machine_1, assembling_machine_2, assembling_machine_3,
	science_pack_1, science_pack_2, science_pack_3, millitary_pack,
];

function getProductByName(name) {
	return products.filter(function(e) {
		return e.name == name;
	})[0];
}
