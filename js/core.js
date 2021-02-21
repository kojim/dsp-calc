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
AssemblyProduct.prototype.energy_usage = 270;
AssemblyProduct.prototype.icon = 'fa fa-industry';


// 採掘機で掘り出すもの
var Ore = function(name, name_jp) {
	this.name     = name;
	this.name_jp  = name_jp;
	this.req_time = 0.5 / 4; // 採掘対象が採掘範囲に4つあることを想定(採掘対象1つごとに2秒に1つ生産される)
};
Ore.prototype = new Product();
Ore.prototype.ingredients = [];
Ore.prototype.energy_usage = 420;
Ore.prototype.require_builder_count =  function(product_per_sec) {
	return product_per_sec / this.req_time;
};
Ore.prototype.icon = 'fas fa-baby-carriage';

// 溶鉱炉で作るもの
var MetalPlate = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
MetalPlate.prototype = new Product();
MetalPlate.prototype.build_rate = 1;
MetalPlate.prototype.energy_usage = 360;
MetalPlate.prototype.icon = 'fas fa-burn';

// 研究施設で作るもの
var MatrixLab = function(name, name_jp, req_time, result_count, ingredients) {
	this.name         = name;
	this.name_jp      = name_jp;
	this.req_time     = req_time;
	this.result_count = result_count;
	this.ingredients  = ingredients;
};
MatrixLab.prototype = new Product();
MatrixLab.prototype.build_rate = 1;
MatrixLab.prototype.energy_usage = 480;
MatrixLab.prototype.icon = 'fas fa-flask';

// -------------------------------------------
// データ定義
// -------------------------------------------

// -----------------
// 鉱石
// -----------------
var iron_ore = new Ore(
  "IronOre", "鉄鉱石"
);
var copper_ore = new Ore(
  "CopperOre", "銅鉱石"
);
var coal = new Ore(
  "Coal", "石炭"
);
var stone = new Ore(
  "Stone", "石"
);

// -----------------
// 精錬系
// -----------------
var iron_ingot = new MetalPlate(
  "IronIngot", "鉄インゴット", 1, 1, [[iron_ore, 1]]
);
var copper_ingot = new MetalPlate(
  "CopperIngot", "銅インゴット", 1, 1, [[copper_ore, 1]]
);
var magnet = new MetalPlate(
  "Magnet", "磁石", 1.5, 1, [[iron_ingot, 1]]
);

// -----------------
// 組立系
// -----------------
var gear = new AssemblyProduct(
  "Gear", "歯車", 1, 1, [[iron_ingot, 1]]
);
var magnet_coil = new AssemblyProduct(
  "MagnetCoil", "磁気コイル", 1, 2, [[magnet, 2], [copper_ingot, 1]]
);
var circuit_board = new AssemblyProduct(
  "CircuitBoard", "回路基板", 1, 2, [[iron_ingot, 2], [copper_ingot, 1]]
);

// -----------------
// 研究系
// -----------------
var matrix_1 = new MatrixLab(
  "ElectromagneticMatrix", "電磁マトリックス", 3, 1, [[magnet_coil, 1], [circuit_board, 1]]
);

var products = [
	iron_ore, copper_ore, coal, stone,
	iron_ingot, copper_ingot, magnet,
	gear, magnet_coil, circuit_board,
	matrix_1
];

function getProductByName(name) {
	return products.filter(function(e) {
		return e.name == name;
	})[0];
}
