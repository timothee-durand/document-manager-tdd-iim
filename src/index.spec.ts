import {describe, it, expect, beforeEach} from 'vitest'
import { DocumentManager, DocumentManager, Folder, TextFile } from '.'

describe('Document Manager', () => {
    let documentManager : DocumentManager;
    beforeEach(() => {
        documentManager = new DocumentManager();
    })

    describe('List ', ()=> {   
         beforeEach(() => {
            const root = new Folder("root");
            const fileTest = new TextFile("testFile")
            root.addChild(new TextFile("file1", "content"));
            documentManager = new DocumentManager(root);
        })
        it('should return ["testFile"] if there is a file named testFile', () => {
            expect(documentManager.getChildren("root")).toStrictEqual(["testFile"])
        })
    })

    describe('Get child', () => {
        let root : Folder;
        beforeEach(() => {
            root = new Folder("root");
            root.addChild(new TextFile("file1", "content"));
            documentManager = new DocumentManager(root);
        })

        it('should return a TextFile with name "file1" and content "content" if i get child "file1"', () => {
            expect(documentManager.getChild("/file1")).toStrictEqual(new TextFile("file1", "content"))
        })

        it('should return root when get /', () => {
            expect(documentManager.getChild("/")).toStrictEqual(root)
        })

        it('should also return root when get ""', () => {
            expect(documentManager.getChild("")).toStrictEqual(root)
        })

        it('should return a TextFile with name "file1" and content "content" if i get child "folder1/file1"', () => {
            const root = new Folder("root");
            const folder1 = new Folder("folder1")
            folder1.addChild(new TextFile("file1", "content"))
            root.addChild(folder1)
            documentManager = new DocumentManager(root)
            expect(documentManager.getChild("/folder1/file1")).toStrictEqual(new TextFile("file1", "content"))
        })
        it('should throw an error if the file does\'t exist', () => {
            function getFile2() {
                documentManager.getChild("/file2")
            }
            expect(getFile2).toThrow("File not found")
        })

        it('should throw an error if the path is incorrect', () => {
            function getFile2() {
                documentManager.getChild("/wrongFolder/file2")
            }
            expect(getFile2).toThrow("Path is not valid")
        })
    })

    describe('Append', () => {
        it('should return "Path is not valid" ', () => {
            function fn() {
                const fileTest = new TextFile("testFile")
                documentManager.addChild("wrongPath", fileTest)
            }
            expect(fn).toThrow("File not found");
        })

        it('should return "/testFile" ', () => {
            const fileTest = new TextFile("testFile")
            expect(documentManager.addChild("/", fileTest)).toBe("/testFile");
        })

        it('should return "root/testFile" ', () => {
            const folderTest = new Folder("folderTest")
            const fileTest = new TextFile("testFile")
            documentManager.addChild("/", folderTest)
            
            expect(documentManager.addChild("/folderTest", fileTest)).toBe("/folderTest/testFile");
        }) 

        it('should return "Can\'t add child to a file" ', () => {
            const fileTest = new TextFile("testFile")
            documentManager.addChild("/", fileTest)
            function fn() {
                const fileTest2 = new TextFile("testFile2")
                documentManager.addChild("/testFile", fileTest2)
            }
            

            expect(fn).toThrow("Can't add child to a file");
        }) 
    })

    describe('Delete', ()=> {
        const root = new Folder("root");
        root.addChild(new TextFile("file1", "content"));
        it("should return an empty root when i delete /file1", () => {
            const manager = new DocumentManager(root)
            manager.delete("/file1")
            const emptyRoot = new Folder("root")
            expect(manager.getChild('')).toStrictEqual(emptyRoot)
        })

        it("should return an empty children property in root when i delete file1", () => {
            const manager = new DocumentManager(root)
            manager.delete("/file1")
            const emptyRoot = new Folder("root")
            expect(manager.getChild('')).toStrictEqual(emptyRoot)
        })
    })
})