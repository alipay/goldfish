export interface CreateGulpConfigOptions {
  baseDir: string;
  distDir: string;
  projectDir: string;
  tsconfigPath?: string;
  configFile?: string;
  type?: string;
  customFileGulp?: FileGulp;
}

export interface TravelPipe {
  fileGulp: {
    type: string;
    glob: string[];
    processors: Processor[];
  };
  options: CreateGulpConfigOptions;
  travelData: ProcessorTravelContext;
  stream: NodeJS.ReadWriteStream;
}

export type CombinePipe = Omit<TravelPipe, 'stream'>

export interface Processor {
  name: string;
  desc?: string;
  handler(value: TravelPipe): NodeJS.ReadWriteStream;
}

export type ProcessorTravelFile = {
  type: string;
  source: string;
  output: string;
};

export type ProcessorTravelContext = {
  files: ProcessorTravelFile[];
};

export interface FileGulp {
  [type: string]: {
    glob: string[];
    processors: Processor[];
  };
}

export interface FileGulpOptions {
  type?: string;
  souceBaseDir: string;
  excludeDistDir: string;
  customFileGulp?: FileGulp | ((v: FileGulp) => FileGulp);
}

export interface ProcessorOptions extends CreateGulpConfigOptions {
  files: string[];
}
