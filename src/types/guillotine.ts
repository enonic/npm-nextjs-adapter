import type {PublishInfo} from '@enonic-types/core';
import type {PageComponent, PageData} from './component';
import type {MetaData} from './componentProps';
import type {Context} from './next';
import type {RecursivePartial} from './util';


export interface GuillotineError {
    errorType: string
    locations: {
        line: number
        column: number
    }[]
    message: string
    validationErrorType?: string
}

// A specific observed error
export interface GuillotineValidationError extends GuillotineError {
    errorType: 'ValidationError'
    validationErrorType: string // 'FieldUndefined'
}

// export interface GuillotineErrorResponseJson {
//     errors: GuillotineError[]
// }

// export interface GuillotineOkResponseJson<Data = Record<string,unknown>> {
//     data: Data
// }

// export type GuillotineResponseJson<Data> = GuillotineOkResponseJson<Data> | GuillotineErrorResponseJson;

export interface GuillotineResponseJson<Guillotine = RecursivePartial<HeadlessCms>> {
    // NOTE: guillotine is the actual field on the top Query, but can be used multiple times via aliases
    data?: Record<string, Guillotine>
    errors?: GuillotineError[]
}

export interface GuillotineResponse<Data = Record<string,unknown>> {
    json: () => Promise<GuillotineResponseJson<Data>>
    text: () => Promise<string>
    ok: boolean
    status: number
}

/**
 * Sends one query to the guillotine API and asks for content type, then uses the type to select a second query and variables, which is sent to the API and fetches content data.
 * @param contentPath string or string array: pre-split or slash-delimited _path to a content available on the API
 * @returns FetchContentResult object: {data?: T, error?: {code, message}}
 */
export type ContentFetcher = (context: Context) => Promise<FetchContentResult>;

export interface ContentResult<Content = Record<string, unknown>> extends Result {
    contents?: Content[]
}

export interface FetchContentResult extends Result {
    data: Record<string, any> | null
    common: Record<string, any> | null
    meta: MetaData
    page: PageComponent | null
}

// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export interface GuillotineRequestHeaders {
    Cookie?: string
    locale: string
    locales: string
    'default-locale': string
}

export type GuillotineResult = Result & Record<string, any>;

export interface MetaResult extends Result {
    meta?: {
        _path: string
        type: string
        pageAsJson?: PageData
        components?: PageComponent[]
    }
}

export interface Result {
    error?: {
        code: string
        message: string
    } | null
}

// Types from Query Playground Docs:

interface AccessControlEntry {
    principal: PrincipalKey
    allow: [Permission]
    deny: [Permission]
}

interface Attachment {
    name: string
    label: string
    size: number
    mimeType: string
    attachmentUrl: string
}

type DateTime = string;

export interface Component {
    type: ComponentType
    path: string
    page?: PageComponentData | null
    layout?: LayoutComponentData | null
    image?: ImageComponentData | null
    part?: PartComponentData | null
    text?: TextComponentData | null
    fragment?: FragmentComponentData | null
}

type ComponentType = 'page' | 'layout' | 'image' | 'part' | 'text' | 'fragment';

interface Content {
    _id: string // !
    _name: string // !
    _path: string // !
    _references?: Content[]
    _score?: number
    creator?: PrincipalKey
    modifier?: PrincipalKey
    createdTime?: DateTime
    modifiedTime?: DateTime
    owner?: PrincipalKey
    type?: string
    contentType?: ContentType
    displayName?: string
    hasChildren?: boolean
    language?: string
    valid?: boolean
    dataAsJson?: JSON
    x?: ExtraData
    xAsJson?: JSON
    pageAsJson?: JSON
    pageTemplate?: Content
    components?: Component[]
    attachments?: Attachment[]
    publish?: PublishInfo
    pageUrl?: string
    site?: portal_Site
    parent?: Content
    children?: Content[]
    childrenConnection?: ContentConnection
    permissions?: Permissions
}

interface ContentConnection {
    totalCount: Int
    edges: ContentEdge[]
    pageInfo: PageInfo
}

interface ContentEdge {
    node: Content
    cursor: string
}

interface ContentType {
    name: string
    displayName: string
    description: string
    superType: string
    abstract: boolean
    final: boolean
    allowChildContent: boolean
    contentDisplayNameScript: string
    icon: Icon
    form: FormItem[]
    formAsJson: JSON
    getInstances: Content[]
    getInstanceConnection: ContentConnection
}

type ExtraData<App = Record<string,unknown>> = App & {
    media: XData_media_ApplicationConfig
    base: XData_base_ApplicationConfig
};

type Float = number;

interface FormItem {
    formItemType: FormItemType
    name: string
    label: string
}

type FormItemType = 'ItemSet' | 'Layout' | 'Input' | 'OptionSet';

interface FragmentComponentData {
    id: string
    fragment: Content
}

interface GeoPoint {
    value: string
    latitude: Float
    longitude: Float
}

export interface HeadlessCms {
    get?: Content
    getChildren?: Content[]
    getChildrenConnection?: ContentConnection
    getPermissions?: Permissions
    getSite?: portal_Site
    getType?: ContentType
    getTypes?: ContentType[]
    query?: Content[]
    queryConnection?: QueryContentConnection
    queryDsl?: Content[]
    queryDslConnection?: QueryDSLContentConnection
}

interface Icon {
    mimeType: string
    modifiedTime: string
}

interface Image {
    image: Content
    ref: string
    style: ImageStyle
}

interface ImageComponentData {
    id: string
    caption?: string
    image: media_Image
}

interface ImageStyle {
    name: string
    aspectRatio: string
    filter: string
}

type Int = number;

type JSON = Record<string, unknown>;

interface LayoutComponentData {
    descriptor: string
    configAsJson: JSON | null
}

interface Link {
    ref: string
    uri: string
    media: Media
    content: Content
}

type LocalDateTime = string;

interface Macro_system_disable_DataConfig {
    body: string
}

interface Macro_system_embed_DataConfig {
    body: string
}

interface Macro {
    ref: string
    name: string
    descriptor: string
    config: MacroConfig
}

interface MacroConfig {
    disable: Macro_system_disable_DataConfig
    embed: Macro_system_embed_DataConfig
}

interface Media {
    content: Content
    intent: MediaIntentType
}

type MediaIntentType = 'download' | 'inline';

interface media_Image extends Content {
    mediaUrl: string
    imageUrl: string
    data: media_Image_Data
}

interface media_Image_Data {
    media: MediaUploader
    caption: string
    altText: string
    artist: string[]
    copyright: string
    tags: string[]
}

interface MediaFocalPoint {
    x: number
    y: number
}

interface MediaUploader {
    attachment: string
    focalPoint: MediaFocalPoint
}

interface PageComponentData {
    descriptor?: string
    customized?: boolean
    configAsJson?: JSON
    template?: Content | null
}

interface PageInfo {
    startCursor: string // !
    endCursor: string // !
    hasNext: boolean // !
}

interface PartComponentData<Config = Record<string, unknown>> {
    descriptor: string
    config: Config
    configAsJson: JSON
}

type Permission = 'READ' | 'CREATE' | 'MODIFY' | 'DELETE' | 'PUBLISH' | 'READ_PERMISSIONS' | 'WRITE_PERMISSIONS';

interface Permissions {
    inheritsPermissions: boolean
    permissions: AccessControlEntry[]
}

interface portal_Site extends Content {
    data: portal_Site_Data
}

interface portal_Site_Data {
    description: string
}

type PrincipalType = 'user' | 'group' | 'role';

interface PrincipalKey {
    value: string
    type: PrincipalType
    idProvider: string
    principalId: string
}

interface QueryContentConnection extends ContentConnection {
    aggregationsAsJson: JSON
}

interface QueryDSLContentConnection extends QueryContentConnection {
    highlightAsJson: JSON
}

interface RichText {
    raw: string
    processedHtml: string
    macrosAsJson: JSON
    macros: Macro[]
    images: Image[]
    links: Link[]
}

interface TextComponentData {
    value: RichText
}

interface XData_base_ApplicationConfig {
    gpsInfo: XData_base_gpsInfo_DataConfig
}

interface XData_base_gpsInfo_DataConfig {
    geoPoint: GeoPoint
    altitude: String
    direction: String
}

interface XData_media_ApplicationConfig {
    imageInfo: XData_media_imageInfo_DataConfig
    cameraInfo: XData_media_cameraInfo_DataConfig
}

interface XData_media_imageInfo_DataConfig {
    pixelSize: number
    imageHeight: number
    imageWidth: number
    contentType: string
    description: string
    byteSize: number
    colorSpace: string[]
    fileSource: string
}

interface XData_media_cameraInfo_DataConfig {
    date: LocalDateTime
    make: string
    model: string
    lens: string
    iso: string
    focalLength: string
    focalLength35: string
    exposureBias: string
    aperture: string[]
    shutterTime: string
    flash: string
    autoFlashCompensation: string
    whiteBalance: string
    exposureProgram: string
    shootingMode: string
    meteringMode: string
    exposureMode: string
    focusDistance: string
    orientation: string
}