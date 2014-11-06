/*
The MIT License (MIT)

Copyright (c) 2013-2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// This is the actual React view that will display the buttons
var View = React.createClass({
  getInitialState: function() {
    // We initialize the default light as the active light. The activeLight state
    // will be used to set the active button styling
    return {
      activeLight: this.props.defaultLight
    };
  },
  onClick: function(e) {
    // Get the ID for the light. The target is the anchor, which doesn't have the
    // ID on it, so we have to reach into the parent
    var id = e.target.parentNode.id;

    // We don't want to make a network call if nothing has changed
    if (id != this.state.activeLight) {
      $.post('/api/lights', {
        id: id
      }).done(function() {
        // Once we receive word that the Raspberry Pi changed the lights, update
        // the state. This will cause the scene to re-render, updating the styling.
        this.setState({
          activeLight: id
        });
      }.bind(this));
    }
  },
  render: function() {
    // Create one pill button for each light. Each <li> element contains an ID,
    // which helps React to render more efficiently, a role (used by Bootstrap),
    // an onClick handler that will contact the Rasperry Pi to change the light,
    // and the CSS class to indicate if the button is active or not.
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

// Start by getting the lighting status from the Raspberry Pi
$.get('/api/lights').done(function(lights) {

  // Lights comes back as a string, which we need to parse. We could get
  // fancy and have the Pi set the proper headers for auto-parsing, but laziness.
  lights = JSON.parse(lights);

  // Render the view for the first time to the "content" div.
  React.render(
    new View(lights),
    document.getElementById('content')
  );
});
