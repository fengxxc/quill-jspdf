export default interface IFont {
    url: string;
    id: string;
    fontStyle: string;
    fontWeight?: string | number;
    encoding?:
      | "StandardEncoding"
      | "MacRomanEncoding"
      | "Identity-H"
      | "WinAnsiEncoding";
}