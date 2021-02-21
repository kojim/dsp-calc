var counter = 0;
var Product = React.createClass({
  getInitialState: function() {
    var product, cps, imports, language;
    if (this.props.product === undefined) {
      product = iron_ore;
    } else {
      product = getProductByName(decodeURI(this.props.product));
    }
    if (this.props.cps === undefined) {
      cps = 0.5;
    } else {
      cps = Number(this.props.cps);
    }
    if (this.props.imports === undefined) {
      imports = []
    } else {
      imports = decodeURI(this.props.imports).split('_');
    }
    if (this.props.language === undefined) {
      language = 'Japanese'
    } else {
      language = this.props.language;
    }
    return {
      product : product,
      cps     : cps,
      imports : imports,
      language: language
    };
  },
  renderProductOptions: function() {
    var thiz = this;
    return products.map(function(p) {
      return(
        <option value={p.name}>{thiz.state.language=='Japanese' ? p.name_jp : p.name}</option>
      );
    });
  },
  renderIngredients: function() {
    var thiz = this;
    var result = []
    $.each(this.state.product.require_ingredient_count(this.state.cps, this.state.imports), function(name, icps) {
      result.push(
        <Ingredient key={thiz.state.product.name + '_' + name}
                    product={getProductByName(name)} cps={icps}
                    addImport={thiz.addImport}
                    removeImport={thiz.removeImport}
                    cannotImport={thiz.state.product.name == name}
                    language={thiz.state.language}
                    isImport={$.inArray(name, thiz.state.imports) !== -1} />
      );
    });
    return result;
  },
  handleLanguageChanged: function(event) {
    this.setState({language: event.target.value});
  },
  handleProductChanged: function(event) {
    var name = event.target.value;
    this.setState({product: getProductByName(name), imports: []});
  },
  handleCpsChanged: function(event) {
    if (event.target.value == "") {
      return;
    }
    var val = Number(event.target.value);
    if (isNaN(val)) {
      return;
    }
    if (val == 0) {
      return;
    }
    this.setState({cps: Number(event.target.value)});
  },
  addImport: function(name) {
    var imports = this.state.imports;
    imports.push(name);
    this.setState({imports: $.unique(imports)});
  },
  removeImport: function(name) {
    var imports = this.state.imports.filter(function(i) {
      return i != name;
    });
    this.setState({imports: imports});
  },
  text: function(e,j) {
    return this.state.language == 'Japanese' ? j:e;
  },
  render: function() {
    document.title = this.state.language == 'Japanese' ? this.state.product.name_jp : this.state.product.name;
    document.location.hash = '#product=' + encodeURI(this.state.product.name) +
                             '&cps=' + this.state.cps +
                             '&imports=' + encodeURI(this.state.imports.join('_')) +
                             '&language=' + this.state.language;
    var parentonly = (
      <div>
        <h3>各種想定</h3>
        <ul>
          <li>組み立て機はMK.Iを使用することを想定</li>
          <li>採掘機の採掘対象数は4つであることを想定（つまり採掘速度を2.0/sと想定）</li>
        </ul>
        <h3>その他</h3>
        <ul>
          <li>自分で使うものしかデータ登録してないのでこれが欲しいって人は <a href="https://twitter.com/kojim">@kojim</a> まで。</li>
          <li>Githubリポジトリは<a href="https://github.com/kojim/dsp-calc">こちら</a>。PullRequest受付中</li>
          <li>他の人が作った<a href="https://calc.dsp-wiki.com/">もっと良いツール</a>があります</li>
        </ul>
      </div>
    );
    return (
      <div className='container'>
        <select onChange={this.handleLanguageChanged} defaultValue={this.state.language}>
          <option>Japanese</option>
          <option>English</option>
        </select>
        <h3> {this.text('Product', '生産物')}</h3>
        <p>
        <select onChange={this.handleProductChanged} defaultValue={this.state.product.name}>
          {this.renderProductOptions()}
        </select>
        <input type='text' onChange={this.handleCpsChanged} defaultValue={this.state.cps}></input>/s
        </p>
        <h3> {this.text('Ingredient', '必要素材')}</h3>
        <table className='table table-bordered table-striped'>
          <thead>
            <tr>
              <th> {this.text('name', '名前')}</th>
              <th> <i className="fa fa-arrow-down"></i>/<i className="fa fa-truck"></i> {this.text('producing area', '生産方法')}</th>
              <th> <i className="fa fa-industry"></i> {this.text('require builders', '必要設備数')}</th>
              <th> <i className="fa fa-bolt"></i> {this.text('power', '消費電力')}</th>
              <th> <i className="fa fa-exchange"></i> {this.text('producing/import speed', '生産/搬入速度')}</th>
            </tr>
          </thead>
          <tbody>
            { this.renderIngredients() }
          </tbody>
        </table>
        {window == window.parent? parentonly : ''}
      </div>
    );
  }
});
var Ingredient = React.createClass({
  getInitialState: function() {
    return {
      isImport: this.props.isImport,
      cannotImport: false
    };
  },
  handleNotImport: function() {
    this.setState({isImport: false});
    this.props.removeImport(this.props.product.name);
  },
  handleImport: function() {
    this.setState({isImport: true});
    this.props.addImport(this.props.product.name);
  },
  text: function(e,j) {
    return this.props.language == 'Japanese' ? j:e;
  },
  render: function() {
    var req_builder = this.props.product.require_builder_count(this.props.cps);
    return (
      <tr>
        <td><i className={this.props.product.icon}></i> {this.text(this.props.product.name, this.props.product.name_jp)}</td>
        <td>
          <input type='radio' name={this.props.product.name} onChange={this.handleNotImport}
                              defaultChecked={!this.state.isImport} > {this.text('local', '現地')}</input>
          <input type='radio' name={this.props.product.name} onChange={this.handleImport}
                              defaultChecked={this.state.isImport}
                              disabled={this.props.cannotImport}> {this.text('import', '搬入')}</input>
        </td>
        <td>{req_builder.toFixed(1)}</td>
        <td>{this.state.isImport? 0 :(req_builder*this.props.product.energy_usage).toFixed(0)}kW</td>
        <td>{this.props.cps.toFixed(3)}/s</td>
      </tr>
    );
  }
});

var params = {}
$.each(window.location.hash.substring(1).split('&'), function(i, kv) {
	kv_array = kv.split('=');
	params[kv_array[0]] = kv_array[1];
});
React.render(
  <Product product={params['product']} cps={params['cps']} imports={params['imports']} language={params['language']}></Product>,
  document.getElementById('app-container')
);
