export interface PublicationModel {
    authors: string
    theme: string
    published: string
    link: string
}

export interface PublicationsByDateDto {
    date: string
    publications: PublicationModel[]
}

export interface WorkModel {
    authors: string
    theme: string
    published: string
}

export interface WorksByProjectTypeDto {
    title: string
    hash: string
    works: WorkModel[]
}

export interface SearchResultItem {
    type: string
    id?: number
    authors?: string
    theme?: string
    published?: string
    link?: string
    title?: string
    hash?: string
}

export interface SearchResponse {
    results: SearchResultItem[]
}
