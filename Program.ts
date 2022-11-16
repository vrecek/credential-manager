import mongoose from "mongoose"
import promptSync from 'prompt-sync'
import KVPType from "./model/KVPInterface"
import KVP from "./model/KVPSchema"

type CredentialsReturn = {dbname: string, password: string, username: string}

const prompt = promptSync({sigint: true})

export default class Program {
    private mongoUri: string

    public constructor(clusterPassword: string, databaseName: string, username: string) {
        this.mongoUri = `mongodb+srv://${username}:${clusterPassword}@${process.env.CLUSTER_NAME}.pexvq.mongodb.net/${databaseName}?retryWrites=true&w=majority`
    }

    private displayOptionHandler(): void {
        console.log('1. Back to menu')
        console.log('2. Exit\n')

        const input: number = this.askForMenuOption()

        if(input === 2) {
            process.exit(0)
        }
    }

    private printKVPObjects(objects: KVPType[]): void {
        this.clr()

        if(!objects.length) {
            console.log('No objects found.\n\n');
            return
        }

        for(let x of objects) {
            console.log(
`>>> ${x.name} <<<

Mail: ${x.m}
Password: ${x.p}
INFO: ${x.additionalInfo ?? '-'}
ID: ${x._id}
________________________________________
                `);
        }
    }
    
    public static askForCredentials(): CredentialsReturn {
        const username: string = prompt('Enter username: ')
        const password: string = prompt('Enter cluster password: ')
        const dbname: string = prompt('Enter database name: ')

        return {dbname, password, username}
    }

    public printMenu(): void {
        this.clr()

        console.log(
`=============================================================

    MENU

    1. View all objects
    2. Add new object
    3. Find object by name
    4. Delete object
    5. Exit

=============================================================
        `)
    }

    public askForMenuOption(): number {
        const input: string = prompt('')

        return parseInt(input) ?? 0
    }

    public clr(): void {
        process.stdout.write('\u001b[3J\u001b[1J');
        console.clear();
    }

    public async displayObjects(): Promise<void> {
        this.clr()
        console.log('Searching...');

        const objects = await KVP.find()
                                 .lean()


        this.printKVPObjects(objects)

        this.displayOptionHandler()
    }

    public async createObject(): Promise<void> {
        this.clr()

        const name: string = prompt('Enter name: ')
        const m: string = prompt('Enter mail: ')
        const p: string = prompt('Enter password: ')
        const additonalInfo: string = prompt('(optional) Enter additional info: ')

        if(!name || !m || !p) {
            console.log('\nYou must fill required fields. Please try again\n');
            process.exit(1)
        }

        console.log('\n\nAdding...');

        const kvpobj = new KVP({
            name,
            m,
            p,
            additionalInfo: additonalInfo ?? null
        })

        await kvpobj.save()

        this.clr()
        console.log('Successfully added \n\n');

        this.displayOptionHandler()
    }

    public async deleteObject(): Promise<void> {
        this.clr()

        const id: string = prompt('Enter objects ID: ')

        console.log('\nDeleting...')

        if(!mongoose.isValidObjectId(id) || !await KVP.exists({_id: id}).lean() ) {
            this.clr()

            console.log('Object does not exist. Check its ID\n');
            this.displayOptionHandler()

            return
        }

        await KVP.deleteOne(
            {_id: id}
        )

        this.clr()
        console.log('Successfully Deleted \n');

        this.displayOptionHandler()
    }

    public async findObject(): Promise<void> {
        this.clr()
        
        const name: string = prompt('Enter name to find: ')

        console.log('\nSearching...');

        const rx: RegExp = new RegExp(name, 'i')
        const searchedObj = await KVP.find({ name: { $regex: rx } })
                                     .lean()


        this.printKVPObjects(searchedObj)

        this.displayOptionHandler()
    }
    
    public async initDatabase(): Promise<void> {
        try {
            console.log('Connecting...');
            await mongoose.connect(this.mongoUri)
    
        }catch(err) {
            throw { message: '\nAuthentication failed. Check your credentials' }
        }
    }
}