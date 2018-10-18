import React, {Component} from 'react';
import {
    AsyncStorage,
} from 'react-native';
import GitHubTrending from 'GitHubTrending';

export var FLAG_STORAGE = {
    flag_popular: 'popular',
    flag_trending: 'trending'
}
export default class DataRepository {

    constructor(flag) {
        this.flag = flag;
        if (flag === FLAG_STORAGE.flag_trending) {
            this.githubTrend = new GitHubTrending();
        }
    }

    fetchRepository(url) {
        return new Promise((resolve, reject) => {
            this.fetchLocalRepository(url)
                .then(result => {
                    if (result) {
                        resolve(result);
                    } else {
                        this.fetchNetRepository(url)
                            .then(result => {
                                resolve(result);
                            })
                            .catch(e => {
                                reject(e)
                            })
                    }
                })
                .catch(e => {
                    this.fetchNetRepository(url)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(e => {
                            reject(e)
                        })
                })
        });
    }

    fetchLocalRepository(url) {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(url, (error, result) => {
                if (!error) {
                    try {
                        resolve(JSON.parse(result))
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(error);
                }
            });
        });
    }

    fetchNetRepository(url) {
        return new Promise((resolve, reject) => {
            if (this.flag === FLAG_STORAGE.flag_trending) {
                this.githubTrend.fetchTrending(url)
                    .then(result => {
                        if (!result) {
                            reject(new Error('response is null'));
                            return;
                        }
                        resolve(result)
                        this.saveRepository(url, result);
                    })
                    .catch(error => {
                        reject(error)
                    })
            } else {
                fetch(url)
                    .then(response => response.json())
                    .then(result => {
                        if (!result) {
                            reject(new Error('response is null'));
                            return;
                        }
                        resolve(result)
                        this.saveRepository(url, result.items);
                    })
                    .catch(error => {
                        reject(error)
                    });
            }

        })
    }

    saveRepository(url, items, callBack) {
        if (!url || !items) return;
        let data = {
            items: items,
            update_date: new Date().getTime()
        }
        AsyncStorage.setItem(url, JSON.stringify(data), callBack);
    }

    checkDate(longTime) {
        let cDate = new Date();
        let tDate = new Date();
        tDate.setTime(longTime);
        if (cDate.getMonth() !== tDate.getMonth()) return false;
        if (cDate.getDay() !== tDate.getDay()) return false;
        if (cDate.getHours() - tDate.getHours() > 4) return false;
        return true;
    }
}