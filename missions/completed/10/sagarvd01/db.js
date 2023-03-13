const path = require('path');
const sqlite3 = require('sqlite3');

class DB{
    constructor(){
        this.db = this.openDB();
        this.error = null;
        if(this.db){
            this.createTable(this.db);
        }
    }

    openDB(){
        let db = new sqlite3.Database(path.resolve(__dirname,'db/users.db'), (err) => {
            if (err) {
                return false;
            }
        });
        return db;
    }

    closeDB(db){
        db.close((err) => {
            if (err) {
                return false;
            }
        });
    }

    createTable(db){
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                userId INTEGER PRIMARY KEY,
                wallet TEXT,
                lastClaim DATETIME,
                lastTx TEXT
            )`;
       db.run(sql);
    }

    getUserDetails(userId){
        return new Promise( (resolve, reject) => {
            const sql = `
            SELECT * FROM users WHERE userId = ?`;
            this.db.get(sql, [userId], (err, row) => {
                if(err){
                    reject(false);
                }
                resolve(row);
            });
        })
        
    }

    checkIfUserOrWalletExist(userId, wallet){
        return new Promise( (resolve, reject) => {
            const sql = `
            SELECT * FROM users WHERE userId = ? OR wallet = ?`;
            this.db.get(sql, [userId, wallet], (err, row) => {
                if(err){
                    reject(false);
                }
                resolve(row);
            });
        })
    }
    
    addUser(userId, wallet){
        return new Promise( (resolve, reject) => {
            const sql = `
            INSERT INTO users(userId, wallet, lastClaim, lastTx) values(?, ?, ?, ?)
            `;
            this.db.run(sql, [userId, wallet, null, null], (err) => {
                if(err){
                    reject(false);
                }
                else{
                    resolve(true);
                }
            })
        })
    }

    setClaimTime(userId, claim){
        return new Promise( (resolve, reject) => {
            const sql = `
            UPDATE users SET lastClaim = ? WHERE userId = ?`;
            this.db.run(sql, [claim, userId], (err) => {
                if(err){
                    reject(false);
                }
                else{
                    resolve(true);
                }
            })
        })
    }

    setLastClaimTx(tx, userId){
        return new Promise( (resolve, reject) => {
            const sql = `
            UPDATE users SET lastTx = ? WHERE userId = ?`;
            this.db.run(sql, [tx, userId], (err) => {
                resolve(true);
            })
        })
    }

}

module.exports = DB;