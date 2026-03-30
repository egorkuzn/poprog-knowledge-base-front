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
    id?: number | string
    sourceId?: number
    authors?: string
    theme?: string
    published?: string
    link?: string
    title?: string
    hash?: string
    groupTitle?: string | null
    groupHash?: string | null
}

export interface SearchResponse {
    query?: string
    total?: number
    items: SearchResultItem[]
}
