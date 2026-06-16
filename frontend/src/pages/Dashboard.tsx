import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Activity, 
  ArrowRight, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp as SparklineIcon,
  HelpCircle,
  Plus
} from 'lucide-react';
import { useAccounts, useTransactions, useCategories } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, balance: number, dateLabel: string } | null>(null);

  // Helper to format currency
  const formatCurrency = (amount: number, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderFormattedCurrency = (amount: number, currency = 'BRL') => {
    const formatted = formatCurrency(amount, currency);
    const parts = formatted.split(',');
    if (parts.length === 2) {
      return (
        <span className="font-display font-bold">
          {parts[0]}
          <span className="text-sm font-medium opacity-50">,{parts[1]}</span>
        </span>
      );
    }
    return <span className="font-display font-bold">{formatted}</span>;
  };

  if (!currentUserId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
          <AlertCircle size={40} className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Eleve o nível das suas finanças</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            O Finance Twin ajuda você a espelhar suas escolhas atuais contra o seu comportamento ideal de gastos. Ative um perfil para ver a inteligência acontecer.
          </p>
        </div>
        <Link to="/users" className="inline-block">
          <Button variant="brand">
            Selecionar Perfil <ArrowRight size={15} className="ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Raw calculation stats
  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  
  const realIncome = transactions?.filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  const realExpense = transactions?.filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const expenseTransactions = transactions?.filter(t => t.type === 'EXPENSE' || t.type === 'TRANSFER_OUT') || [];

  // Twin Health Score calculation
  // F2: Savings capacity (weight 25%). Meta: poupar >= 20%
  let savingsRate = 0;
  let f2Score = 0;
  if (realIncome > 0) {
    savingsRate = (realIncome - realExpense) / realIncome;
    if (savingsRate >= 0.20) {
      f2Score = 100;
    } else if (savingsRate < 0) {
      f2Score = 0;
    } else {
      f2Score = Math.round((savingsRate / 0.20) * 100);
    }
  }

  // F5: Expense frequency (weight 10%). Meta: <= 12 dias de despesa no mês
  const expenseDates = new Set(
    expenseTransactions
      .filter(t => t.type === 'EXPENSE')
      .map(t => new Date(t.transactionDate).toDateString())
  );
  const expenseDaysCount = expenseDates.size;
  let f5Score = 100;
  if (expenseDaysCount > 12) {
    f5Score = Math.max(0, 100 - (expenseDaysCount - 12) * 5);
  }

  // F4: Cash stability (weight 15%). Meta: saldo cobrir >= 3 meses de despesas
  let f4Score = 0;
  let monthsOfCoverage = 0;
  if (realExpense > 0) {
    monthsOfCoverage = totalBalance / realExpense;
    if (monthsOfCoverage >= 3) {
      f4Score = 100;
    } else {
      f4Score = Math.round((monthsOfCoverage / 3) * 100);
    }
  } else if (totalBalance > 0) {
    f4Score = 100;
  }

  // Weighted factors (F1, F3, F6 defaulted to good or calculated)
  const f1Score = realIncome > 0 && realExpense / realIncome <= 0.5 ? 100 : 70;
  const f3Score = 100;
  const f6Score = 100;

  const finalScore = Math.round(
    (f1Score * 0.25) + 
    (f2Score * 0.25) + 
    (f3Score * 0.15) + 
    (f4Score * 0.15) + 
    (f5Score * 0.10) + 
    (f6Score * 0.10)
  );

  const hasTransactions = transactions && transactions.length > 0;

  // Twin Insights
  const getInsights = () => {
    const list = [];
    if (!hasTransactions) {
      list.push({
        title: 'Seu histórico ainda está sendo construído',
        description: 'Adicione contas e registre suas primeiras movimentações de receitas ou despesas no menu para começar a receber recomendações automáticas do seu Twin.',
        type: 'info'
      });
      return list;
    }

    if (transactions.length < 5) {
      list.push({
        title: 'Adicione mais transações para visualizar tendências',
        description: 'Quanto mais transações você registrar, mais preciso e inteligente será o seu Twin Health Score e as recomendações automáticas.',
        type: 'info'
      });
    }

    if (savingsRate < 0.20 && savingsRate >= 0) {
      list.push({
        title: 'Taxa de economia baixa',
        description: `Sua poupança atual é de ${(savingsRate * 100).toFixed(1)}%. Tente guardar pelo menos 20% do salário para equilibrar seu Twin de Saúde.`,
        type: 'warning'
      });
    } else if (savingsRate < 0 && realIncome > 0) {
      list.push({
        title: 'Balanço negativo detectado',
        description: 'Seus débitos superaram seus créditos neste mês. É recomendado conter gastos variáveis.',
        type: 'danger'
      });
    }

    if (expenseDaysCount > 12) {
      list.push({
        title: 'Frequência de consumo impulsivo',
        description: `Lançamentos efetuados em ${expenseDaysCount} dias diferentes. Consolidar suas compras ajuda a evitar saídas acidentais.`,
        type: 'warning'
      });
    }

    if (monthsOfCoverage < 3 && totalBalance > 0) {
      list.push({
        title: 'Reserva de liquidez insuficiente',
        description: `Seu saldo acumulado cobre apenas ${monthsOfCoverage.toFixed(1)} meses de saídas. Busque estender esse indicador para 3 meses.`,
        type: 'info'
      });
    }

    if (list.length === 0) {
      list.push({
        title: 'Twin totalmente alinhado!',
        description: 'Excelentes escolhas financeiras. Continue registrando seus lançamentos com precisão.',
        type: 'success'
      });
    }
    return list;
  };

  const activeInsights = getInsights();

  // SVG Radial score circle configuration
  const arcRadius = 55;
  const arcStrokeWidth = 8;
  const arcCircumference = 2 * Math.PI * arcRadius;
  const arcOffset = hasTransactions 
    ? arcCircumference - (finalScore / 100) * arcCircumference 
    : arcCircumference;

  const getScoreColorClass = (score: number) => {
    if (!hasTransactions) return 'text-zinc-500 stroke-zinc-700';
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  // 1. Math balance reconstruction logic for historic Area Chart (strictly using actual data)
  const getChronologicalBalanceHistory = () => {
    if (!transactions || transactions.length === 0) return [];
    
    // Sort transactions by date ascending
    const sortedAsc = [...transactions].sort((a, b) => 
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    // Backtrack from totalBalance
    const history = [];
    let runningBalance = totalBalance;

    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      const t = sortedAsc[i];
      history.push({
        date: new Date(t.transactionDate),
        balance: runningBalance,
        label: new Date(t.transactionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      });

      const isExpense = t.type === 'EXPENSE' || t.type === 'TRANSFER_OUT';
      const isIncome = t.type === 'INCOME' || t.type === 'TRANSFER_IN';

      if (isExpense) {
        runningBalance += t.amount;
      } else if (isIncome) {
        runningBalance -= t.amount;
      }
    }

    return history.reverse();
  };

  const balanceHistory = getChronologicalBalanceHistory();
  const hasHistoryData = balanceHistory.length >= 2;

  // Mini sparkline for the hero card
  const renderMiniSparkline = () => {
    if (balanceHistory.length < 2) return null;
    const balances = balanceHistory.map(h => h.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;
    
    const width = 140;
    const height = 34;
    const padding = 2;
    
    const points = balanceHistory.map((h, i) => {
      const x = padding + (i / (balanceHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.balance - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="overflow-visible select-none pointer-events-none opacity-85">
        <polyline
          fill="none"
          stroke="hsl(var(--color-brand))"
          strokeWidth="1.5"
          points={points}
          className="drop-shadow-[0_0_3px_rgba(99,102,241,0.4)]"
        />
        {balanceHistory.length > 0 && (
          <circle
            cx={padding + width - 2 * padding}
            cy={height - padding - ((balanceHistory[balanceHistory.length - 1].balance - min) / range) * (height - 2 * padding)}
            r="2"
            className="fill-indigo-400 stroke-indigo-200"
            strokeWidth="0.5"
          />
        )}
      </svg>
    );
  };

  // Render SVG Area Path for balance history
  const renderBalanceHistorySVG = () => {
    if (!hasHistoryData) return null;

    const width = 500;
    const height = 180;
    const padding = 25;

    const balances = balanceHistory.map(h => h.balance);
    const minBal = Math.min(...balances, 0); // anchor min at 0 or below if negative
    const maxBal = Math.max(...balances, 100);

    const rangeY = maxBal - minBal || 1;
    const rangeX = balanceHistory.length - 1 || 1;

    const getX = (index: number) => padding + (index / rangeX) * (width - 2 * padding);
    const getY = (bal: number) => height - padding - ((bal - minBal) / rangeY) * (height - 2 * padding);

    // Build the SVG path line
    let pathD = `M ${getX(0)} ${getY(balanceHistory[0].balance)}`;
    for (let i = 1; i < balanceHistory.length; i++) {
      pathD += ` L ${getX(i)} ${getY(balanceHistory[i].balance)}`;
    }

    // Build area fill path (closes path at bottom)
    const areaD = `${pathD} L ${getX(balanceHistory.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={getY(minBal)} x2={width - padding} y2={getY(minBal)} stroke="#13131a" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(maxBal)} x2={width - padding} y2={getY(maxBal)} stroke="#13131a" strokeWidth="1" strokeDasharray="3 3" />

        {/* Shaded Area */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Solid Top Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--color-brand))" strokeWidth="2" strokeLinecap="round" />

        {/* Data points */}
        {balanceHistory.map((pt, i) => {
          const isHovered = hoveredPoint && hoveredPoint.balance === pt.balance;
          return (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(pt.balance)}
              r={isHovered ? "5" : "3.5"}
              className={`transition-all duration-150 ${
                isHovered 
                  ? 'fill-indigo-300 stroke-indigo-100 shadow-md' 
                  : 'fill-[hsl(var(--bg-primary))] stroke-[hsl(var(--color-brand))]'
              }`}
              strokeWidth="2"
            />
          );
        })}

        {/* Hover vertical dotted lines and tracking triggers */}
        {balanceHistory.map((pt, i) => {
          const cx = getX(i);
          const cy = getY(pt.balance);
          const isHovered = hoveredPoint && hoveredPoint.balance === pt.balance;
          
          return (
            <g key={i}>
              {isHovered && (
                <line
                  x1={cx}
                  y1={padding}
                  x2={cx}
                  y2={height - padding}
                  stroke="rgba(99, 102, 241, 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
              {/* Overlay hover trigger circle */}
              <circle
                cx={cx}
                cy={cy}
                r="24"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint({
                    x: cx,
                    y: cy,
                    balance: pt.balance,
                    dateLabel: pt.label
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}

        {/* X Axis Labels */}
        {balanceHistory.length > 0 && (
          <>
            <text x={getX(0)} y={height - 5} fill="currentColor" className="text-[9px] text-zinc-500 font-mono" textAnchor="start">
              {balanceHistory[0].label}
            </text>
            {balanceHistory.length > 2 && (
              <text x={getX(Math.floor(balanceHistory.length / 2))} y={height - 5} fill="currentColor" className="text-[9px] text-zinc-500 font-mono" textAnchor="middle">
                {balanceHistory[Math.floor(balanceHistory.length / 2)].label}
              </text>
            )}
            <text x={getX(balanceHistory.length - 1)} y={height - 5} fill="currentColor" className="text-[9px] text-zinc-500 font-mono" textAnchor="end">
              {balanceHistory[balanceHistory.length - 1].label}
            </text>
          </>
        )}
      </svg>
    );
  };

  // 2. Category Donut Chart aggregation logic
  const getExpensesByCategory = () => {
    if (!transactions || !categories) return [];
    
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const sums: { [key: string]: number } = {};

    expenses.forEach(t => {
      if (t.categoryId) {
        sums[t.categoryId] = (sums[t.categoryId] || 0) + t.amount;
      }
    });

    const list = Object.keys(sums).map(catId => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Sem Categoria',
        amount: sums[catId],
        color: cat?.color || '#6366f1'
      };
    });

    // Sort descending by amount
    return list.sort((a, b) => b.amount - a.amount);
  };

  const categoryExpenses = getExpensesByCategory();
  const totalCategoryExpenses = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
  const hasCategoryData = categoryExpenses.length > 0;

  // Render SVG Donut segments sequentially
  const renderCategoryDonutSVG = () => {
    if (!hasCategoryData) return null;

    const donutRadius = 40;
    const donutCircumference = 2 * Math.PI * donutRadius; // 251.32
    let accumulatedPercent = 0;

    return (
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={donutRadius}
          fill="transparent"
          className="stroke-zinc-900"
          strokeWidth="10"
        />
        {categoryExpenses.map((item) => {
          const percent = item.amount / totalCategoryExpenses;
          const length = percent * donutCircumference;
          const offset = -accumulatedPercent * donutCircumference;
          accumulatedPercent += percent;

          return (
            <circle
              key={item.id}
              cx="80"
              cy="80"
              r={donutRadius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="10"
              strokeDasharray={`${length} ${donutCircumference - length}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500 hover:stroke-[12px] cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white">
      
      {/* Upper Header: User Selector & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">Meu Painel Financeiro</h2>
          <p className="text-xs text-zinc-400 mt-1">Visão integrada das decisões e balanço histórico acumulado.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/transactions">
            <Button variant="secondary" className="text-xs">
              Lançar Movimentação <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </Link>
          <Link to="/accounts">
            <Button variant="primary" className="text-xs">
              Nova Conta
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Twin Health Score Card */}
        <Card variant="glass" className="lg:col-span-1 flex flex-col justify-between p-6 relative overflow-hidden border-t-2 border-t-indigo-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <CardHeader className="mb-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-400" />
                Score Comportamental
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={arcRadius}
                  className="stroke-zinc-900"
                  strokeWidth={arcStrokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={arcRadius}
                  className={`transition-all duration-1000 ease-out ${getScoreColorClass(finalScore).split(' ')[1]}`}
                  strokeWidth={arcStrokeWidth}
                  fill="transparent"
                  strokeDasharray={arcCircumference}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-extrabold font-display tracking-tight ${getScoreColorClass(finalScore).split(' ')[0]}`}>
                  {hasTransactions ? finalScore : '--'}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-display mt-0.5">
                  {hasTransactions ? 'Pontos' : 'Pendente'}
                </span>
              </div>
            </div>
            
            {/* Horizontal indicators of factors */}
            <div className="w-full space-y-2.5 mt-6">
              <div className="flex justify-between items-center text-[10px] font-medium text-zinc-400">
                <span>Poupança (Meta 20%):</span>
                <span className="font-mono text-white">{hasTransactions ? `${f2Score}/100` : '--/100'}</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full transition-all duration-500" style={{ width: `${hasTransactions ? f2Score : 0}%` }} />
              </div>

              <div className="flex justify-between items-center text-[10px] font-medium text-zinc-400">
                <span>Frequência Gastos:</span>
                <span className="font-mono text-white">{hasTransactions ? `${f5Score}/100` : '--/100'}</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full transition-all duration-500" style={{ width: `${hasTransactions ? f5Score : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Patrimônio & Storytelling flow */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hero Card */}
          <Card className="md:col-span-3 glow-card premium-card-border vercel-grid relative overflow-hidden p-8 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Wallet size={12} className="text-indigo-400" /> Patrimônio Líquido Acumulado
                </span>
                <div className="text-5xl md:text-6xl text-white font-black font-display tracking-tight leading-none">
                  {renderFormattedCurrency(totalBalance)}
                </div>
              </div>
              {/* Sparkline display on the right */}
              {hasHistoryData && (
                <div className="flex flex-col items-end gap-1.5 shrink-0 bg-zinc-950/40 border border-zinc-900 px-4 py-3 rounded-2xl">
                  <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 font-display">Tendência do Saldo</span>
                  {renderMiniSparkline()}
                </div>
              )}
            </div>
            
            <div className="mt-8 text-xs text-zinc-400 leading-relaxed font-sans max-w-2xl bg-zinc-900/20 border border-zinc-800/20 p-4 rounded-xl backdrop-blur-xs">
              {realIncome > 0 ? (
                <span>
                  Neste mês, você arrecadou um total de <strong className="text-emerald-400 font-mono font-medium">{formatCurrency(realIncome)}</strong> e efetuou <strong className="text-rose-400 font-mono font-medium">{formatCurrency(realExpense)}</strong> em despesas, resultando em uma taxa de poupança real de <strong className="text-indigo-400 font-mono font-medium">{(savingsRate * 100).toFixed(1)}%</strong> da sua renda.
                </span>
              ) : (
                <span>Cadastre suas receitas e despesas no menu <strong className="text-indigo-400">Transações</strong> para ver a análise comportamental e o storytelling financeiro integrado.</span>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="glow-card premium-card-border bg-zinc-950/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <CardHeader className="pb-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-display">Entradas Reais</span>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold font-mono text-emerald-400">{formatCurrency(realIncome)}</div>
            </CardContent>
          </Card>

          <Card className="glow-card premium-card-border bg-zinc-950/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            <CardHeader className="pb-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-display">Despesas Reais</span>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold font-mono text-rose-400">{formatCurrency(realExpense)}</div>
            </CardContent>
          </Card>

          <Card className="glow-card premium-card-border bg-zinc-950/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <CardHeader className="pb-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-display">Reservas Totais</span>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold font-mono text-indigo-400">{formatCurrency(totalBalance)}</div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Grid: Charts & Analytical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center: Evolution of Net Worth Chart */}
        <Card className="lg:col-span-2 glow-card premium-card-border relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 font-display flex items-center gap-2 font-bold">
              <SparklineIcon size={14} className="text-indigo-400" />
              Evolução do Saldo
            </CardTitle>
            <CardDescription className="text-[10px] text-zinc-500">Curva retroativa real baseada em suas movimentações.</CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-center relative">
            {hasHistoryData ? (
              <div className="w-full h-full relative">
                {renderBalanceHistorySVG()}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-zinc-950/95 border border-zinc-800 px-3 py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.9)] text-left pointer-events-none z-10 transition-all duration-75 text-[10px] space-y-1 backdrop-blur-md"
                    style={{ 
                      left: `${(hoveredPoint.x / 500) * 100}%`, 
                      top: `${(hoveredPoint.y / 180) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-display">{hoveredPoint.dateLabel}</div>
                    <div className="font-extrabold text-indigo-400 font-mono text-xs">{formatCurrency(hoveredPoint.balance)}</div>
                  </div>
                )}
              </div>
            ) : (
              // Elegant Educational Empty State
              <div className="text-center space-y-3 p-6 max-w-sm">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <HelpCircle size={18} />
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">Histórico em construção</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Adicione pelo menos 2 transações em datas diferentes no menu de **Transações** para começar a visualizar as tendências do seu saldo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Category Breakdown Donut */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-zinc-400 font-display">Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição proporcional dos gastos do usuário.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-56 space-y-4">
            {hasCategoryData ? (
              <div className="flex items-center gap-6 w-full justify-center">
                <div className="shrink-0">
                  {renderCategoryDonutSVG()}
                </div>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {categoryExpenses.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-[10px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-zinc-300 truncate max-w-[80px]">{item.name}</span>
                      <span className="text-zinc-500 font-mono">({Math.round((item.amount / totalCategoryExpenses) * 100)}%)</span>
                    </div>
                  ))}
                  {categoryExpenses.length > 4 && (
                    <span className="text-[9px] text-zinc-500 italic pl-4">+{categoryExpenses.length - 4} categorias</span>
                  )}
                </div>
              </div>
            ) : (
              // Elegant Educational Empty State
              <div className="text-center space-y-3 p-6 max-w-xs">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Plus size={18} />
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">Sem despesas registradas</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Classifique seus lançamentos para visualizar a divisão dos seus gastos por categoria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Grid: Twin AI Insights & Active Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Callout Twin AI Insights Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-display flex items-center gap-2">
            <Activity size={14} className="text-indigo-400" />
            Recomendações do Twin
          </h3>
          <div className="space-y-4">
            {activeInsights.map((insight, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                  insight.type === 'danger' 
                    ? 'bg-rose-500/5 border-rose-500/10 text-rose-300' 
                    : insight.type === 'warning' 
                      ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' 
                      : insight.type === 'success'
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'
                        : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Custom Holographic Account Cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-display flex items-center gap-2">
            <Wallet size={14} className="text-indigo-400" />
            Contas Conectadas
          </h3>
          <div className="space-y-3.5">
            {accounts?.slice(0, 3).map((acc) => (
              <div 
                key={acc.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between h-32 transition-transform hover:scale-[1.01] ${
                  acc.type === 'CHECKING' 
                    ? 'gradient-card-blue' 
                    : acc.type === 'SAVINGS'
                      ? 'gradient-card-pink'
                      : 'gradient-card-emerald'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white tracking-wide">
                    {acc.name}
                  </span>
                  <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest text-zinc-100">
                    {acc.type}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Saldo Disponível
                  </span>
                  <div className="text-xl font-bold font-display text-white">
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                </div>
              </div>
            ))}
            {accounts && accounts.length > 3 && (
              <Link to="/accounts" className="block text-center text-xs text-zinc-400 hover:text-white hover:underline pt-2 font-medium">
                Ver mais {accounts.length - 3} contas →
              </Link>
            )}
            {(!accounts || accounts.length === 0) && (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                Nenhuma conta conectada.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
