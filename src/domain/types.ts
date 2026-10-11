export type Weights = Record<string, number>;
export type CoverKind = 'original' | 'otra_edicion' | 'institucional';
export interface Book {
 id:string; workId:string; title:string; authorIds:string[]; contributors:{authorId:string;role:string}[];
 collectionId:string|null; isbn:string|null; topicIds:string[]; weights:Weights; summary:string; productUrl:string;
 verified:boolean; verifiedAt:string; evidence:string;
 cover:{kind:CoverKind;file:string;sourceUrl:string|null;editionNote:string|null;reviewed:boolean;attempts:string[]};
}
export interface Topic {id:string;label:string;shortLabel:string;description:string;enabled:boolean;tag:string;facets:string[]}
export interface Tag {id:string;label:string}
export interface Author {id:string;name:string}
export interface Collection {id:string;name:string}
export interface Option {id:string;text:string;weights:Weights}
export interface Question {id:string;topicIds:string[];text:string;options:Option[];approach:string}
export interface Catalog {books:Book[];topics:Topic[];tags:Tag[];authors:Author[];collections:Collection[];requiredAuthorIds:string[]}
export type Answers = Record<string,string>;
export interface Match {book:Book;score:number;matchedTags:string[]}
