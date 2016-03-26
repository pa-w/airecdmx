<?php
$cn = pg_connect ("dbname=airecdmx user=paw");
$q = pg_query ('SELECT * FROM "all"');
while ($f = pg_fetch_assoc ($q)) { 
	foreach ($f as $k => $v) { 
		if (!empty ($f ['datetime'])) {
			@list ($est, $cont) = explode ("_", $k);
			$x = explode ("_", $k);
			$est = $x [0];
			$cont = trim (implode ("_", array_slice ($x, 1)));
			if (!empty ($cont) && $cont != "fid") { 
				echo "{$f['datetime']} $est $cont = $v\n";
				pg_query ("INSERT INTO aire (fecha,estacion,contaminante,medicion) VALUES ('{$f['datetime']}', '{$est}', '{$cont}', '{$v}')");
			}
		}
	}
}
?>
