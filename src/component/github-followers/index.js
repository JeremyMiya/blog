/**
 * Created by axetroy on 17-4-6.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Spin, Pagination } from 'antd';

import github from '../../lib/github';
import { storeFollower } from '../../redux/follower';
import pkg from '../../../package.json';

class GithubFollowers extends Component {
  state = {
    meta: {
      page: 1,
      per_page: 30
    }
  };

  async componentWillMount() {
    await this.getFollowers(this.state.meta.page, this.state.meta.per_page);
  }

  async getFollowers(page, per_page) {
    let followers = [];
    try {
      const {
        data,
        headers
      } = await github.get(`/users/${pkg.config.owner}/followers`, {
        params: { page, per_page }
      });
      followers = data;

      /**
       * Pagination
       * # see detail https://developer.github.com/guides/traversing-with-pagination/
       */
      if (headers.link) {
        const last = headers.link.match(/<([^>]+)>(?=\;\s+rel="last")/);
        const lastPage = last ? last[1].match(/page=(\d+)/)[1] : page;
        this.setState({
          meta: {
            ...this.state.meta,
            ...{ page, per_page, total: lastPage * per_page }
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({
      meta: {
        ...this.state.meta,
        ...{ page, per_page }
      }
    });
    if (page === 1) this.props.storeFollower(followers);
    return followers;
  }

  changePage(page, per_page) {
    return this.getFollowers(page, per_page);
  }

  render() {
    return (
      <Spin spinning={!this.props.FOLLOWER || !this.props.FOLLOWER.length}>
        <Row>
          {this.props.FOLLOWER.map(user => {
            return (
              <Col className="text-center" span={4} key={user.login}>
                <a href={user.html_url} target="_blank">
                  <img
                    src={user.avatar_url}
                    style={{ width: '10rem', maxWidth: '100%' }}
                    alt=""
                  />
                  <br />
                  <sub>{user.login}</sub>
                </a>
              </Col>
            );
          })}
        </Row>
        {this.state.meta.total > 0
          ? <Row className="text-center">
              <Pagination
                onChange={page =>
                  this.changePage(page, this.state.meta.per_page)}
                defaultCurrent={this.state.meta.page}
                defaultPageSize={this.state.meta.per_page}
                total={this.state.meta.total}
              />
            </Row>
          : ''}
      </Spin>
    );
  }
}

export default connect(
  function mapStateToProps(state) {
    return { FOLLOWER: state.FOLLOWER };
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        storeFollower: storeFollower
      },
      dispatch
    );
  }
)(GithubFollowers);