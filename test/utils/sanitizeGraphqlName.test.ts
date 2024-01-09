import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {sanitizeGraphqlName} from '../../src/utils/sanitizeGraphqlName';


describe('utils', () => {
    describe('sanitizeGraphqlName', () => {
        it("returns '' when passed ''", () => {
            expect(sanitizeGraphqlName('')).toEqual('');
        });

        it("returns '' when text is empty after trimming whitespace", () => {
            expect(sanitizeGraphqlName(' \n \t ')).toEqual('');
        });

        it("replaces illegal chars with _", () => {
            expect(sanitizeGraphqlName(' 0\nA.a\ta ')).toEqual('_0_A_a_a_');
        });

        it("inserts _ if first char is a digit", () => {
            expect(sanitizeGraphqlName('0')).toEqual('_0');
        });

        it("does unicode folding? NOPE", () => {
            expect(sanitizeGraphqlName(
                'ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ'
            )).toBe(
                '_Y_y_I_N_N_i_n_'
            );
        });
    });
});