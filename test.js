import childProcess from 'child_process';
import test from 'ava';
import execa from 'execa';

test.cb('main', t => {
	const cp = childProcess.spawn('./cli.js', {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 0);
		t.end();
	});
});

test('--json', async t => {
	const {stdout} = await execa('./cli.js', ['--json']);
	const x = JSON.parse(stdout);
	t.truthy(x.ping);
	t.truthy(x.upload);
	t.truthy(x.download);
	t.falsy(x.data);
});

test('--verbose --json', async t => {
	const {stdout} = await execa('./cli.js', ['--verbose', '--json']);
	const x = JSON.parse(stdout);
	t.truthy(x.ping);
	t.truthy(x.upload);
	t.truthy(x.download);
	t.truthy(x.data);
});
