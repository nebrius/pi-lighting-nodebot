var View = React.createClass({
  getInitialState: function() {
    return {
      activeLight: this.props.defaultLight
    };
  },
  onClick: function(e) {
    var id = e.target.parentNode.id;
    if (id != this.state.activeLight) {
      $.post('/api/lights', {
        id: id
      }).done(function() {
        this.setState({
          activeLight: id
        });
      }.bind(this));
    }
  },
  render: function() {
    return (
      <ul className="nav nav-pills nav-stacked" role="tablist">
        {this.props.lights.map(function (light) {
          return <li
            id={light.id}
            role="presentation"
            onClick={this.onClick}
            className={this.state.activeLight == light.id ? 'active' : ''}
          >
            <a href="#">{light.name}</a>
          </li>;
        }.bind(this))}
      </ul>
    );
  }
});

$.get('/api/lights').done(function(lights) {
  lights = JSON.parse(lights);
  React.render(
    new View(lights),
    document.getElementById('content')
  );
});
