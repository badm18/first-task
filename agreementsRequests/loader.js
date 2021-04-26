import React from 'react';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import store from '../../../../store';
import actions from '../actions';
import JustOpenScreen from '../../../common/JustOpenScreen';

const Loader = compose(
  withRouter,
  connect(() => ({})),
  (Component) => (props) => {

    const justOpenScreen = function () {
      store.dispatch(
        actions.openScreen({
          _type: 'adminAgreements',
      }));
    };
    return <JustOpenScreen func={justOpenScreen} />;
  }
)(props => null);

export default Loader;
