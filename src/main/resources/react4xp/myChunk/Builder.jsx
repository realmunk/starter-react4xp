import React from 'react';

class Builder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: props.first,
            second: props.second,
        }
    };

    // Doubles the targeted state string
    makeMore = (key) => {
        this.setState({[key]: this.state[key] + " " + this.state[key]});
    };

    render() {
        return <div className="chunked-builder">
            <h2>
                <span onClick={() => this.makeMore('first')}
                      style={{cursor: "pointer"}}
                      className="first">{this.state.first}
                </span> <span onClick={() => this.makeMore('second')}
                      style={{cursor: "pointer"}}
                      className="second">{this.state.second}</span>
            </h2>
        </div>;
    }
};


// ----------------------------------------------  Export

export default (props) => <Builder {...props} />;
