/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import {
    ApiUrlConfig,
    ContentDto,
    ContentsDto,
    ContentsService,
    DateTime,
    Version
} from './../';

describe('ContentsService', () => {
    let version = new Version('1');

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                ContentsService,
                { provide: ApiUrlConfig, useValue: new ApiUrlConfig('http://service/p/') }
            ]
        });
    });

    afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
        httpMock.verify();
    }));

    it('should make get request to get contents',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        let contents: ContentsDto | null = null;

        contentsService.getContents('my-app', 'my-schema', 17, 13).subscribe(result => {
            contents = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema?$top=17&$skip=13');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush({
            total: 10,
            items: [
                {
                    id: 'id1',
                    isPublished: true,
                    created: '2016-12-12T10:10',
                    createdBy: 'Created1',
                    lastModified: '2017-12-12T10:10',
                    lastModifiedBy: 'LastModifiedBy1',
                    version: 11,
                    data: {}
                },
                {
                    id: 'id2',
                    isPublished: true,
                    created: '2016-10-12T10:10',
                    createdBy: 'Created2',
                    lastModified: '2017-10-12T10:10',
                    lastModifiedBy: 'LastModifiedBy2',
                    version: 22,
                    data: {}
                }
            ]
        });

        expect(contents).toEqual(
            new ContentsDto(10, [
                new ContentDto('id1', true, 'Created1', 'LastModifiedBy1',
                    DateTime.parseISO_UTC('2016-12-12T10:10'),
                    DateTime.parseISO_UTC('2017-12-12T10:10'),
                    {},
                    new Version('11')),
                new ContentDto('id2', true, 'Created2', 'LastModifiedBy2',
                    DateTime.parseISO_UTC('2016-10-12T10:10'),
                    DateTime.parseISO_UTC('2017-10-12T10:10'),
                    {},
                    new Version('22'))
        ]));
    }));

    it('should append query to get request as search',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        let contents: ContentsDto | null = null;

        contentsService.getContents('my-app', 'my-schema', 17, 13, 'my-query').subscribe(result => {
            contents = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema?$search="my-query"&$top=17&$skip=13');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush({ total: 10, items: [] });
    }));

    it('should append ids to get request with ids',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        let contents: ContentsDto | null = null;

        contentsService.getContents('my-app', 'my-schema', 17, 13, null, ['id1', 'id2']).subscribe(result => {
            contents = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema?$top=17&$skip=13&ids=id1,id2');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush({ total: 10, items: [] });
    }));

    it('should append query to get request as plain query string',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        let contents: ContentsDto | null = null;

        contentsService.getContents('my-app', 'my-schema', 17, 13, '$filter=my-filter').subscribe(result => {
            contents = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema?$filter=my-filter&$top=17&$skip=13');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush({ total: 10, items: [] });
    }));

    it('should make get request to get content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        let content: ContentDto | null = null;

        contentsService.getContent('my-app', 'my-schema', 'content1', version).subscribe(result => {
            content = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema/content1');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBe(version.value);

        req.flush({
            id: 'id1',
            isPublished: true,
            created: '2016-12-12T10:10',
            createdBy: 'Created1',
            lastModified: '2017-12-12T10:10',
            lastModifiedBy: 'LastModifiedBy1',
            version: 11,
            data: {}
        });

        expect(content).toEqual(
            new ContentDto('id1', true, 'Created1', 'LastModifiedBy1',
                DateTime.parseISO_UTC('2016-12-12T10:10'),
                DateTime.parseISO_UTC('2017-12-12T10:10'),
                {},
                new Version('11')));
    }));

    it('should make post request to create content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        const dto = {};

        let content: ContentDto | null = null;

        contentsService.postContent('my-app', 'my-schema', dto, true, version).subscribe(result => {
            content = result;
        });

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema?publish=true');

        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.get('If-Match')).toBe(version.value);

        req.flush({
            id: 'id1',
            isPublished: true,
            created: '2016-12-12T10:10',
            createdBy: 'Created1',
            lastModified: '2017-12-12T10:10',
            lastModifiedBy: 'LastModifiedBy1',
            version: 11,
            data: {}
        });

        expect(content).toEqual(
            new ContentDto('id1', true, 'Created1', 'LastModifiedBy1',
                DateTime.parseISO_UTC('2016-12-12T10:10'),
                DateTime.parseISO_UTC('2017-12-12T10:10'),
                {},
                new Version('11')));
    }));

    it('should make put request to update content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        const dto = {};

        contentsService.putContent('my-app', 'my-schema', 'content1', dto, version).subscribe();

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema/content1');

        expect(req.request.method).toEqual('PUT');
        expect(req.request.headers.get('If-Match')).toBe(version.value);

        req.flush({});
    }));

    it('should make put request to publish content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        contentsService.publishContent('my-app', 'my-schema', 'content1', version).subscribe();

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema/content1/publish');

        expect(req.request.method).toEqual('PUT');
        expect(req.request.headers.get('If-Match')).toEqual(version.value);

        req.flush({});
    }));

    it('should make put request to unpublish content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        contentsService.unpublishContent('my-app', 'my-schema', 'content1', version).subscribe();

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema/content1/unpublish');

        expect(req.request.method).toEqual('PUT');
        expect(req.request.headers.get('If-Match')).toEqual(version.value);

        req.flush({});
    }));

    it('should make delete request to delete content',
        inject([ContentsService, HttpTestingController], (contentsService: ContentsService, httpMock: HttpTestingController) => {

        contentsService.deleteContent('my-app', 'my-schema', 'content1', version).subscribe();

        const req = httpMock.expectOne('http://service/p/api/content/my-app/my-schema/content1');

        expect(req.request.method).toEqual('DELETE');
        expect(req.request.headers.get('If-Match')).toEqual(version.value);

        req.flush({});
    }));
});