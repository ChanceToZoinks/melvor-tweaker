declare type Replace<T, TNew> = Omit<T, keyof TNew> & TNew;
declare type IsType<T, IsType, A, B> = T extends IsType ? A : B;
declare type Constructor = { new (...args: any[]): object };
