import Program from './Program'
import path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../', '.env') })

const {dbname, password, username} = Program.askForCredentials()
const app: Program = new Program(password, dbname, username)

const main = async () => {
    try {
        await app.initDatabase()

        while(true) {
            app.printMenu()

            const select: number = app.askForMenuOption()

            switch(select) {
                case 1:
                    await app.displayObjects()
                continue

                case 2:
                    await app.createObject()
                continue

                case 3:
                    await app.findObject()
                continue

                case 4:
                    await app.deleteObject()
                continue

                case 5:
                    app.clr()
                    process.exit(0)

                default:
                    continue
            }
        }
    
    }catch(err: any) {
        console.log(err.message);
        process.exit(1)
    }
}

main()
