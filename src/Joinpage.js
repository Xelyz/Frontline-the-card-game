import React, { Component } from 'react';
import './Joinpage.css';
import { withRouter } from './RouterWrapper';
import Background from './BackgroundWrapper';

class JoinPage extends Component {
  state = { id: '' };
  handleSubmit = () => {
    this.props.navigate('/lobby/' + this.state.id);
  };
  handleChange = (event) => {
    this.setState({
      id: event.target.value,
    });
  };

  render() {
    return (
      <>
        <form>
          <input
            type="text"
            spellCheck="false"
            className="game-code-window shadow-inner"
            autoComplete="off"
            maxLength="11"
            placeholder='Enter match Id here'
            value={this.state.id}
            onChange={this.handleChange}
          />
          <br/>
          <div className="menu-button small" onClick={this.handleSubmit}>
            <span>Join</span>
          </div>
          <div className="menu-button small" onClick={()=>this.props.navigate('/')}>
            <span>Return</span>
          </div>
        </form>
      </>
    );
  }
}

export default Background(withRouter(JoinPage));