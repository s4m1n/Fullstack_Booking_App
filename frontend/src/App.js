import React, { Component } from 'react';
import './App.css';
import Events from './components/Events';
import axios from 'axios';
const api = axios.create({
  baseURL: `http://localhost:5000`,
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      to: '',
      summary: '',
      description: '',
      postedEvent: false,
    };
  }

  getEvents = (e) => {
    e.preventDefault();
    // console.log(e.target.value);
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  setMail = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  setEventTitle = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  setEventDescription = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  sendInvitation = (e) => {
    e.preventDefault();
    const eventDetails = {
      to: this.state.to,
      summary: this.state.summary,
      description: this.state.description,
    };
    console.log(eventDetails);
    axios
      .post('/events', eventDetails)
      .then((res) => (this.state.postedEvent = true));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const tkn = {
      code: this.state.token,
    };
    console.log(tkn);
    api.post('/', tkn).then((res) => (this.state.postedEvent = true));
    // console.log(tkn);
  };

  render() {
    if (this.state.postedEvent) {
      return <Events />;
    }
    return (
      <div className="App">
        <div className="form">
          <form method="POST" onSubmit={this.handleSubmit}>
            <a
              className="button"
              rel="noopener noreferrer"
              target="_blank"
              href="https://accounts.google.com/signin/oauth/oauthchooseaccount?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&response_type=code&client_id=1073125779529-9vn6rrr2mprr6utd4d59fhau9q261mtv.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&o2v=2&as=IgttvtH7j1tEmURopY28CA&flowName=GeneralOAuthFlow"
            >
              Sign In
            </a>
            <span>You need to click sign in first</span>
            <br />
            <br />
            <label htmlFor="token">Paste the copied token here</label>
            <input
              type="text"
              name="token"
              value={this.state.token}
              onChange={(e) => this.getEvents(e)}
              placeholder="must be like Jwt0912nasda...."
            />
            <input type="submit" value="Get my events" />
          </form>
          <form onSubmit={this.sendInvitation}>
            <label htmlFor="attendee email">Attendee email</label>
            <input
              type="email"
              name="to"
              placeholder="Send email to..."
              onChange={(e) => this.setMail(e)}
            />
            <label htmlFor="event title">Event Title</label>
            <input
              type="text"
              name="summary"
              onChange={(e) => this.setEventTitle(e)}
              placeholder="Title of the event"
            />
            <label htmlFor="event body">Event Body</label>
            <input
              type="text"
              name="description"
              onChange={(e) => this.setEventDescription(e)}
              placeholder="The message body"
            />
            <input type="submit" value="Send event invitation" />
          </form>
        </div>
      </div>
    );
  }
}

export default App;
