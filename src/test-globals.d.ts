declare const beforeEach: (callback: () => void | Promise<void>) => void;
declare const describe: (name: string, callback: () => void) => void;
declare const expect: any;
declare const it: (name: string, callback: () => void | Promise<void>) => void;

declare namespace jest {
  type Mock<TArgs extends unknown[] = unknown[], TReturn = unknown> = {
    (...args: TArgs): TReturn;
    mockResolvedValue(value: Awaited<TReturn>): Mock<TArgs, TReturn>;
    mockResolvedValueOnce(value: Awaited<TReturn>): Mock<TArgs, TReturn>;
    mockReturnValue(value: TReturn): Mock<TArgs, TReturn>;
    mockReturnValueOnce(value: TReturn): Mock<TArgs, TReturn>;
    mockImplementation(
      implementation: (...args: TArgs) => TReturn,
    ): Mock<TArgs, TReturn>;
    mockClear(): Mock<TArgs, TReturn>;
  };

  type Mocked<T> = {
    [K in keyof T]: T[K] extends (...args: infer TArgs) => infer TReturn
      ? Mock<TArgs, TReturn>
      : T[K];
  };
}

declare const jest: {
  fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
    implementation?: (...args: TArgs) => TReturn,
  ): jest.Mock<TArgs, TReturn>;
  clearAllMocks(): void;
};
