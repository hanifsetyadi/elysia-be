import { Database } from 'bun:sqlite';

export interface User {
    id: number;
    name: string;
    email: string;
}

export class userDB {
    private db: Database;

    constructor() {
        this.db = new Database('users.db');

        this.init()
            .then(() => {
                console.log('Database initialized');
            }).catch(console.error);
    }

    async getUser(){
        return this.db.query('SELECT * from users').all();
    }

    async getUserWithID(id: number){
        return this.db.query(`SELECT * from users WHERE id = ${id}`).all()
    }

    async addUser(user: User){
        return this.db.query(`INSERT INTO users (name, email) VALUES (?, ?) RETURNING id`).get(user.name, user.email) as User
    }

    async updateUser(id: number, user: User){
        return this.db.run(`UPDATE users SET name = '${user.name}', email = '${user.email}' WHERE id = ${id}`)
    }

    async deleteUser(id: number) {
        return this.db.run(`DELETE FROM users WHERE id = ${id}`)
    }

    async init(){
        return this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(55), email VARCHAR(55))')
    }
    
}